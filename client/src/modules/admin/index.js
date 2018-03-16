import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import ServicesAPI from 'apis/services';
import { Auth, NavBar } from 'modules/core';
import styled from 'styled-components';
import { Button, Cell, Grid, HeaderCell, Row } from 'components';
import { Link } from 'react-router-dom';
import IconPencil from 'react-icons/lib/fa/pencil';
import Edit from './Edit';

const mapStateToProps = (state, ownProps) => {
  const selectedId = _.get(ownProps, 'match.params.id', null);
  return {
    selectedId: parseInt(selectedId, 10)
  };
};
export default connect(mapStateToProps)(
  class AdminIndex extends Component {
    state = {
      data: []
    };
    handleAuthFail = () => {
      const { history } = this.props;

      history.replace('login');
    };
    handleAuthSuccess = () => {
      ServicesAPI.retrieve().then(({ data }) => {
        this.setState({ data });
      });
    };
    handleEditClose = () => {
      const { history } = this.props;

      history.push('/admin');
    };
    render() {
      const { data } = this.state;
      const { selectedId } = this.props;
      return (
        <Wrapper>
          <NavBar hasSwitcher={false} title="Roster System" />
          <Body>
            <Auth
              onFail={this.handleAuthFail}
              onSuccess={this.handleAuthSuccess}>
              <Grid>
                <thead>
                  <Row>
                    <HeaderCell>ID</HeaderCell>
                    <HeaderCell>Service Title</HeaderCell>
                    <HeaderCell>Positions</HeaderCell>
                    <HeaderCell>Footnote Label</HeaderCell>
                    <HeaderCell>Occurrence</HeaderCell>
                    <HeaderCell>Actions</HeaderCell>
                  </Row>
                </thead>
                <tbody>
                  {data.map(
                    ({ footnoteLabel, frequency, label, id, positions }) => (
                      <Row key={id}>
                        <Cell>{id}</Cell>
                        <Cell>
                          <Link to={`/admin/edit/${id}`}>{label}</Link>
                        </Cell>
                        <Cell>{positions.length}</Cell>
                        <Cell>{footnoteLabel}</Cell>
                        <Cell>{_.capitalize(frequency)}</Cell>
                        <Cell>
                          <Link to={`/admin/edit/${id}`}>
                            <Button kind="blue">
                              <IconEdit />
                              Edit
                            </Button>
                          </Link>
                        </Cell>
                      </Row>
                    )
                  )}
                </tbody>
              </Grid>
            </Auth>
          </Body>
          {!!(selectedId && _.isNumber(selectedId)) && (
            <Edit
              data={_.find(data, { id: selectedId })}
              onClose={this.handleEditClose}
            />
          )}
        </Wrapper>
      );
    }
  }
);

const Wrapper = styled.div``;
const Body = styled.div`
  margin: 10px;
`;
const IconEdit = styled(IconPencil)`
  margin-right: 4px;
`;