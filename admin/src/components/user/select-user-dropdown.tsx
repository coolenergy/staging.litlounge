import { PureComponent } from 'react';
import { Select } from 'antd';
import { sortBy } from 'lodash';
import { userService } from '@services/user.service';
const { Option } = Select;

interface IProps {
  placeholder?: string;
  style?: Record<string, string>;
  defaultValue?: any;
  onSelect: Function;
  disabled?: boolean;
}

export class SelectUserDropdown extends PureComponent<IProps> {
  _initialData = [];
  state = {
    data: [] as any,
    value: undefined
  };

  componentDidMount() {
    this.loadUsers();
  }

  async loadUsers(q?: string) {
    // TODO - should check for better option?
    const resp = await userService.search({ limit: 1000 });
    this._initialData = sortBy(resp.data.data, (i) => i.username);
    this.setState({
      data: [...this._initialData]
    });
  }

  handleSearch = (value) => {
    const q = value.toLowerCase();
    const filtered = this._initialData.filter((p) => {
      return p.username.includes(q) || (p.name || '').toLowerCase().includes(q);
    });
    this.setState({ data: filtered });
  };

  render() {
    const { disabled } = this.props;
    return (
      <Select
        showSearch
        value={this.state.value}
        placeholder={this.props.placeholder}
        style={this.props.style}
        defaultActiveFirstOption={false}
        showArrow={true}
        filterOption={false}
        onSearch={this.handleSearch}
        onChange={this.props.onSelect.bind(this)}
        notFoundContent={null}
        defaultValue={this.props.defaultValue || undefined}
        disabled={disabled}
        allowClear
      >
        {this.state.data.map((p) => (
          <Option key={p._id} value={p._id}>
            <span>
              <strong>{p.username}</strong> / <span>{p.name}</span>
            </span>
          </Option>
        ))}
      </Select>
    );
  }
}
