import React, { PureComponent } from 'react';
import { Button, Input, Row, Col } from 'antd';
import Link from 'next/link';

interface IProps {
  onSubmit: Function;
}

export class SearchFilter extends PureComponent<IProps> {
  state = {
    q: ''
  };

  render() {
    return (
      <Row gutter={24}>
        <Col xl={{ span: 4 }} md={{ span: 8 }}>
          <Input
            placeholder="Enter keyword"
            onChange={(evt) => this.setState({ q: evt.target.value })}
            onPressEnter={() => this.props.onSubmit(this.state)}
          />
        </Col>
        <Col xl={{ span: 4 }} md={{ span: 8 }}>
          <Button
            type="primary"
            onClick={() => this.props.onSubmit(this.state)}
          >
            Search
          </Button>
        </Col>
        <Col flex={1}>
          <Link href="/performer/category/create">
            <a className="ant-btn ant-btn-primary" style={{float: 'right'}}>Create</a>
          </Link>
        </Col>
      </Row>
    );
  }
}
