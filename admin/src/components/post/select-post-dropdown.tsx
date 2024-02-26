import { PureComponent } from 'react';
import { Select } from 'antd';
import { sortBy } from 'lodash';
import { postService } from '@services/post.service';
import { IPost } from 'src/interfaces';
const { Option } = Select;

interface IProps {
  placeholder?: string;
  style?: Record<string, string>;
  value?: any;
  defaultValue?: any;
  onSelect: (value: string, data: IPost) => void;
  disabled?: boolean;
}

export class SelectPostDropdown extends PureComponent<IProps> {
  _initalData = [];
  state = {
    data: [] as any,
  };

  componentDidMount() {
    this.loadPosts();
  }

  async loadPosts(q?: string) {
    // TODO - should check for better option?
    const resp = await postService.search({ limit: 1000 });
    this._initalData = sortBy(resp.data.data, i => i.slug);
    this.setState({
      data: [...this._initalData]
    });
  }

  handleSearch = value => {
    const q = value.toLowerCase();
    const filtered = this._initalData.filter(p => {
      return p.slug.includes(q) || (p.title || '').toLowerCase().includes(q);
    });
    this.setState({ data: filtered });
  };

  render() {
    const { data } = this.state;
    const { disabled, value, defaultValue, onSelect } = this.props;
    return (
      <Select
        showSearch
        value={value}
        placeholder={this.props.placeholder}
        style={this.props.style}
        defaultActiveFirstOption={false}
        showArrow={true}
        filterOption={false}
        onSearch={this.handleSearch}
        onChange={(value) => onSelect(value, data.find(d => d._id === value))}
        notFoundContent={null}
        defaultValue={defaultValue}
        disabled={disabled}
        allowClear>
        {this.state.data.map(p => (
          <Option key={p._id} value={p._id}>
            <span>
              <strong>{p.slug}</strong> / <span>{p.title}</span>
            </span>
          </Option>
        ))}
      </Select>
    );
  }
}
