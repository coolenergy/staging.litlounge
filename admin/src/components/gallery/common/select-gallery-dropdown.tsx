import { PureComponent } from 'react';
import { Select } from 'antd';
import { sortBy } from 'lodash';
import { IGallery } from 'src/interfaces';
import { galleryService } from '@services/gallery.service';
const { Option } = Select;

interface IProps {
  placeholder?: string;
  style?: Record<string, string>;
  defaultValue?: any;
  onSelect: Function;
  disabled?: boolean;
  galleries?: IGallery[];
  isQuery?: boolean;
}

export class SelectGalleryDropdown extends PureComponent<IProps> {
  _initalData = [];
  state = {
    data: [] as any,
    value: undefined
  };

  componentDidMount() {
    if (this.props.isQuery) {
      this.findGalleries();
    }
  }
  async findGalleries() {
    const resp = await galleryService.search({
      limit: 1000
    });
    this.setData(resp.data.data || []);
  }

  componentDidUpdate(prevProps: any) {
    if (prevProps.galleries !== this.props.galleries)
      this.setData(this.props.galleries);
  }

  async setData(galleries) {
    this._initalData = sortBy(galleries, (g) => g.performerId);
    this.setState({
      data: [...this._initalData]
    });
  }

  handleSearch = (value) => {
    const q = value.toLowerCase();
    const filtered = this._initalData.filter((g) => {
      return (g.name || '').toLowerCase().includes(q);
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
        {this.state.data.map((g) => (
          <Option key={g._id} value={g._id}>
            <span>
              <span>{g.name}</span>
            </span>
          </Option>
        ))}
      </Select>
    );
  }
}
