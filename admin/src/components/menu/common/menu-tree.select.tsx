import { PureComponent } from 'react';
import { Select, TreeSelect } from 'antd';
import { sortBy } from 'lodash';
import { menuService } from '@services/menu.service';
import { IMenuUpdate } from 'src/interfaces';
import * as _ from 'lodash';
interface IProps {
  placeholder?: string;
  style?: Record<string, string>;
  value?: any;
  defaultValue?: any;
  onSelect: Function;
  disabled?: boolean;
  menu?: IMenuUpdate;
}

export class SelectMenuTreeDropdown extends PureComponent<IProps> {
  _initalData = [];
  state = {
    data: [] as any
  };

  componentDidMount() {
    this.loadMenus();
  }

  buildTree(data = [], parent?: any, tree?: any) {
    tree = typeof tree !== 'undefined' ? tree : [];
    parent = typeof parent !== 'undefined' ? parent : { _id: '' };
    const children = _.filter(data, child => (child.parentId || '') == parent._id);
    if (!_.isEmpty(children)) {
      if (!parent._id) {
        tree = children;
      } else {
        parent['children'] = children;
      }
      _.each(children, child => this.buildTree(data, child));
    }
    return this.mapDataNode(tree);
  }

  async mapDataNode(data: any) {
    if (data && data.length > 0) {
      return Promise.all(
        data.map(async item => {
          let children = [];
          if (item.children) {
            children = await this.mapDataNode(item.children);
          }
          return {
            title: item.title,
            value: item._id,
            ordering: item.ordering,
            children: children.length > 0 ? _.orderBy(children, 'ordering', 'asc') : [],
            disabled: this.props.menu && this.props.menu._id === item._id ? true : false
          };
        })
      );
    }
  }

  async loadMenus(q?: string) {
    // TODO - should check for better option?
    const resp = await menuService.search({ limit: 1000, sortBy: 'ordering', sort: 'asc' });
    this._initalData = sortBy(resp.data.data, i => i.title);
    this.setState({
      data: await this.buildTree(this._initalData)
    });
  }

  handleSearch = value => {
    const q = value.toLowerCase();
    const filtered = this._initalData.filter(p => {
      return p.title.includes(q) || (p.title || '').toLowerCase().includes(q);
    });
    this.setState({ data: this.mapDataNode(filtered) });
  };

  render() {
    const { disabled, defaultValue } = this.props;
    return (
      <TreeSelect
        showSearch
        style={this.props.style || { width: '100%' }}
        value={this.props.value || defaultValue}
        dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
        treeData={this.state.data}
        placeholder={this.props.placeholder || 'Please select'}
        treeDefaultExpandAll
        onChange={value => {
          this.props.onSelect(value);
        }}
        onSearch={this.handleSearch}
        disabled={disabled}
        allowClear
      />
    );
  }
}
