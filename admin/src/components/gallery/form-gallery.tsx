import { PureComponent, createRef } from 'react';
import { Form, Input, Button, InputNumber, Select, Checkbox } from 'antd';
import { IGalleryCreate, IGalleryUpdate } from 'src/interfaces';
import { SelectPerformerDropdown } from '@components/performer/common/select-performer-dropdown';
import { FormInstance } from 'antd/lib/form';

interface IProps {
  gallery?: IGalleryUpdate;
  onFinish: Function;
  submitting?: boolean;
}

export class FormGallery extends PureComponent<IProps> {
  formRef: any;
  state = {
    isSale: false
  };

  componentDidMount() {
    if (!this.formRef) this.formRef = createRef();
    if (this.props.gallery && this.props.gallery.isSale) {
      this.setState({ isSale: true });
    }
  }

  setFormVal(field: string, val: any) {
    const instance = this.formRef.current as FormInstance;
    instance.setFieldsValue({
      [field]: val
    });
  }

  render() {
    if (!this.formRef) this.formRef = createRef();
    const { gallery, onFinish, submitting } = this.props;
    const { isSale } = this.state;
    return (
      <Form
        ref={this.formRef}
        onFinish={onFinish.bind(this)}
        initialValues={
          gallery
            ? gallery
            : ({
              name: '',
              description: '',
              token: 0,
              status: 'draft',
              performerId: '',
              isSale: false
            } as IGalleryCreate)
        }
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
      >
        <Form.Item
          name="performerId"
          label="Performer"
          rules={[{ required: true }]}
        >
          <SelectPerformerDropdown
            disabled={gallery && gallery.performerId ? true : false}
            defaultValue={gallery && gallery.performerId}
            onSelect={(val) => this.setFormVal('performerId', val)}
          />
        </Form.Item>
        <Form.Item
          name="name"
          rules={[
            { required: true, message: 'Please input title of gallery!' }
          ]}
          label="Name"
        >
          <Input placeholder="Enter gallery name" />
        </Form.Item>
        <Form.Item name="isSale" label="Is sale gallery?" >
          <Checkbox
            checked={isSale}
            onChange={(v) => {
              this.setState({ isSale: v.target.checked });
              this.formRef.current.setFieldsValue({ isSale: !isSale })
            }}
          />
        </Form.Item>
        <Form.Item name="token" label="Token">
          <InputNumber disabled={!isSale} min={1} />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true, message: 'Please select status!' }]}
        >
          <Select>
            <Select.Option value="draft">Draft</Select.Option>
            <Select.Option key="active" value="active">
              Active
            </Select.Option>
            <Select.Option key="inactive" value="inactive">
              Inactive
            </Select.Option>
          </Select>
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 4 }}>
          <Button
            type="primary"
            htmlType="submit"
            style={{ float: 'right' }}
            loading={submitting}
          >
            Submit
        </Button>
        </Form.Item>
      </Form>
    );
  }
}
