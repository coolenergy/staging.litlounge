import { PureComponent, createRef } from 'react';
import { Form, Input, Button, message } from 'antd';
const layout = {
  labelCol: { lg: {span: 4} , sm: {span: 6} },
  wrapperCol: { lg: {span: 20}, sm: {span: 18} }
};


interface IProps {
  onFinish: Function;
  socials?: any;
  submiting?: boolean;
  ref?: Function;
}

export class SocialsForm extends PureComponent<IProps> {
  private formRef = createRef() as any;
  formRefSubmit() {
    this.formRef.current.submit();
  }
  render() {
    const {
      socials,
      onFinish,
      submiting,
    } = this.props;
    return (
      <Form
        ref={this.formRef}
        {...layout}
        name="form-performer"
        onFinish={(values) => {
          onFinish({ socials: values })
        }}
        onFinishFailed={() =>
          message.error(
            'Please complete the required fields'
          )
        }
        initialValues={
          socials
            ? socials
            : ({
              facebook: 'facebook.com',
              twitter: 'twitter.com',
              instagram: 'instagram.com'
            })
        }
      >

        <Form.Item name="facebook" label="Facebook">
          <Input placeholder={socials && socials.facebook || ''} />
        </Form.Item>
        <Form.Item name="twitter" label="Twitter">
          <Input placeholder={socials && socials.twitter || ''} />
        </Form.Item>
        <Form.Item name="instagram" label="Instagram" >
          <Input placeholder={socials && socials.instagram || ''} />
        </Form.Item>
        <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 4 }}>
          <Button type="primary" htmlType="submit" loading={submiting}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    );
  }
}
