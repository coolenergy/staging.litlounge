import { PureComponent, createRef } from 'react';
import { Input, Row, Col, Button, Select, DatePicker } from 'antd';
import { SelectPerformerDropdown } from '@components/performer/common/select-performer-dropdown';
import { SelectUserDropdown } from '@components/user/select-user-dropdown';
import { SelectGalleryDropdown } from '@components/gallery/common/select-gallery-dropdown';
import { SelectStudioDropdown } from '@components/studio/select-studio.dropdown';
interface IProps {
  onSubmit?: Function;
  statuses?: {
    key: string;
    text?: string;
  }[];
  sourceType?: {
    key: string;
    text?: string;
  }[];
  searchWithPerformer?: boolean;
  performerId?: string;
  searchWithGallery?: boolean;
  galleryId?: string;
  notWithKeyWord?: boolean;
  withDatePicker?: boolean;
  loading?: boolean;
  setDateRanger?: Function;
  searchWithUser?: boolean;
  userId?: string;
  searchWithStudio?: boolean;
  studioId?: string;
}

export class SearchFilter extends PureComponent<IProps> {
  performerRef: any;
  state = {
    q: '',
    performerId: '',
    studioId: '',
    targetId: '',
    galleryId: ''
  };

  componentDidMount() {
    if (this.props.performerId) {
      this.setState({ performerId: this.props.performerId });
    }
  }

  render() {
    const {
      statuses = [],
      searchWithPerformer,
      performerId,
      galleryId,
      searchWithGallery,
      notWithKeyWord,
      sourceType = [],
      withDatePicker,
      loading,
      setDateRanger,
      searchWithUser,
      userId,
      searchWithStudio,
      studioId
    } = this.props;
    return (
      <Row gutter={24}>
        {!notWithKeyWord && (
          <Col xl={{ span: 4 }} md={{ span: 8 }}>
            <Input
              placeholder="Enter keyword"
              onChange={(evt) => this.setState({ q: evt.target.value })}
              onPressEnter={() => this.props.onSubmit(this.state)}
            />
          </Col>
        )}
        {statuses.length ? (
          <Col xl={{ span: 4 }} md={{ span: 8 }}>
            <Select
              onChange={(val) => this.setState({ status: val })}
              style={{ width: '100%' }}
              placeholder="Select status"
              defaultValue=""
            >
              {statuses.map((s) => (
                <Select.Option key={s.key} value={s.key}>
                  {s.text || s.key}
                </Select.Option>
              ))}
            </Select>
          </Col>
        ) : null}
        {sourceType.length ? (
          <Col xl={{ span: 4 }} md={{ span: 8 }}>
            <Select
              onChange={(val) => this.setState({ sourceType: val })}
              style={{ width: '100%' }}
              placeholder="Select Type"
              defaultValue=""
            >
              {sourceType.map((s) => (
                <Select.Option key={s.key} value={s.key}>
                  {s.text || s.key}
                </Select.Option>
              ))}
            </Select>
          </Col>
        ) : null}
        {searchWithUser && (
          <Col xl={{ span: 6 }} md={{ span: 8 }}>
            <SelectUserDropdown
              placeholder={'Search user'}
              style={{ width: '100%' }}
              onSelect={(val) => this.setState({ sourceId: val || '' })}
              defaultValue={userId || ''}
            />
          </Col>
        )}
        {searchWithPerformer && (
          <Col xl={{ span: 6 }} md={{ span: 8 }}>
            <SelectPerformerDropdown
              placeholder={'Search performer'}
              style={{ width: '100%' }}
              onSelect={(val) => this.setState({ performerId: val || '', studioId: '' })}
              defaultValue={performerId || ''}
            />
          </Col>
        )}
        {searchWithGallery && (
          <Col xl={{ span: 6 }} md={{ span: 8 }}>
            <SelectGalleryDropdown
              placeholder={'Search gallery'}
              style={{ width: '100%' }}
              onSelect={(val) => this.setState({ galleryId: val || '' })}
              defaultValue={galleryId || ''}
              isQuery={true}
            />
          </Col>
        )}
        {searchWithStudio && (
          <Col xl={{ span: 6 }} md={{ span: 8 }}>
            <SelectStudioDropdown
              placeholder={'Search studio'}
              style={{ width: '100%' }}
              onSelect={(val) => this.setState({ targetId: val || '', studioId: val || '', performerId: '' })}
              defaultValue={studioId || ''}
            />
          </Col>
        )}
        {withDatePicker && (
          <Col xl={{ span: 6 }} md={12} xs={24}>
            <div>
              <DatePicker.RangePicker
                disabledDate={() => loading}
                onCalendarChange={setDateRanger.bind(this)}
              />
            </div>
          </Col>
        )}
        <Col xl={{ span: 4 }} md={{ span: 8 }}>
          <Button
            type="primary"
            onClick={() => this.props.onSubmit(this.state)}
          >
            Search
          </Button>
        </Col>
      </Row>
    );
  }
}
