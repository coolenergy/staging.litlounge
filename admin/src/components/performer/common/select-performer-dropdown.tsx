import { PureComponent } from 'react';
import { Select } from 'antd';
import { sortBy } from 'lodash';
import { performerService } from '@services/performer.service';
const { Option } = Select;

interface IProps {
  placeholder?: string;
  style?: Record<string, string>;
  defaultValue?: any;
  onSelect: Function;
  disabled?: boolean;
  query?: any;
}

export class SelectPerformerDropdown extends PureComponent<IProps> {
  _initalData = [];
  state = {
    data: [] as any,
    value: undefined
  };

  componentDidMount() {
    this.loadPerformers();
  }

  async loadPerformers(q?: string) {
    // TODO - should check for better option?
    const { query } = this.props
    const resp = await performerService.search({ limit: 1000, ...query });
    this._initalData = sortBy(resp.data.data, (i) => i.username);
    this.setState({
      data: [...this._initalData]
    });
  }

  handleSearch = (value) => {
    const q = value.toLowerCase();
    const filtered = this._initalData.filter((p) => {
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
        <Option value="">All</Option>
        {this.state.data.map((p) => (
          <Option key={p._id} value={p._id}>
            <span>
              <strong>{p.username}</strong> / <span>{p.name || `${p.firstName} ${p.lastName}`}</span>
            </span>
          </Option>
        ))}
      </Select>
    );
  }
}
