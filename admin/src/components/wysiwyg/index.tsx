import React, { PureComponent, Component } from 'react';
import { EditorState, ContentState, convertToRaw, Modifier } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import { Modal, Input, Form, Button } from 'antd';

import '../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

interface IProps {
  onChange?: Function;
  html?: string;
}

interface IState {
  editorState: any;
}

type CustomLButtonProps = {
  onChange?: Function;
  editorState?: any;
};

class AddHTMLOption extends Component<CustomLButtonProps> {
  formRef =  React.createRef<any>();

  readonly state = {
    showModal: false
  };

  addHTML(data) {
    const { editorState, onChange } = this.props;
    const blocksFromHtml = htmlToDraft(`${data.html}`);
    const { contentBlocks, entityMap } = blocksFromHtml;
    const newState = ContentState.createFromBlockArray(
      contentBlocks,
      entityMap
    );

    const contentState = Modifier.replaceWithFragment(
      editorState.getCurrentContent(),
      editorState.getSelection(),
      newState.getBlockMap()
    );

    onChange(EditorState.push(editorState, contentState, 'insert-characters'));
    this.setState({ showModal: false });
  }

  hanleClick() {
    this.formRef.current.resetFields(['html']);
    // const { editorState, onChange } = this.props;
    // this.formRef.current.setFieldsValue({ html: (draftToHtml(convertToRaw(editorState.getCurrentContent())))})
    this.setState({showModal: true});
  }

  render() {
    const { showModal } = this.state;
    return (
      <>
        <Modal width={700} forceRender title="Insert HTML" visible={showModal} footer={null} onCancel={() => this.setState({ showModal: false })}>
          <Form onFinish={this.addHTML.bind(this)} ref={this.formRef}>
            <Form.Item name="html">
              <Input.TextArea placeholder='<strong>Hello World</strong>' rows={5}/>
            </Form.Item>
            <Form.Item>
              <Button onClick={() => this.setState({ showModal: false })}>Cancel</Button>
              <Button type="primary" htmlType="submit" style={{ marginLeft: 10 }}>Save Changes</Button>
            </Form.Item>
          </Form>
        </Modal>
        <div className='rdw-option-wrapper' onClick={this.hanleClick.bind(this)}>{'</>'}</div>
      </>
    );
  }
}

export default class WYSIWYG extends PureComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      editorState: EditorState.createEmpty()
    };
  }

  componentDidMount() {
    try {
      const { html } = this.props;
      if (html) {
        const blocksFromHtml = htmlToDraft(`<p></p>${html}`);
        const { contentBlocks, entityMap } = blocksFromHtml;
        const contentState = ContentState.createFromBlockArray(
          contentBlocks,
          entityMap
        );
        const editorState = EditorState.createWithContent(contentState);
        this.setState({
          editorState
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  onEditorStateChange: Function = (editorState) => {
    this.props.onChange &&
      this.props.onChange({
        html: draftToHtml(convertToRaw(editorState.getCurrentContent()))
      });

    this.setState({
      editorState
    });
  };

  render() {
    const { editorState } = this.state;
    return (
      <div className="editor">
        <Editor
          editorState={editorState}
          wrapperClassName="wysityg-wrapper"
          editorClassName="wysityg-editor"
          onEditorStateChange={this.onEditorStateChange}
          toolbar={
            {
              // image: {
              //   uploadCallback: uploadImageCallBack,
              //   alt: { present: true, mandatory: true }
              // }
            }
          }
          toolbarCustomButtons={[<AddHTMLOption />]}
        />
      </div>
    );
  }
}
