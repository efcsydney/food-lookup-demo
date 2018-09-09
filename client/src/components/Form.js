import _ from 'lodash';
import React from 'react';
import styled from 'styled-components';
import { media } from 'styled';

export const FormGroup = ({
  align,
  children,
  label,
  labelStyle,
  isRequired,
  ...otherProps
}) => (
  <FormRow align={align} {...otherProps}>
    <FormLabel align={align} style={labelStyle} required={isRequired}>
      {label}
    </FormLabel>
    <span>{children}</span>
  </FormRow>
);

function normalizeKind(name = 'gray') {
  const mappings = {
    default: 'gray',
    warning: 'red'
  };

  if (_.indexOf(_.values(mappings), name) !== -1) {
    return name;
  } else {
    return mappings[name] || 'gray';
  }
}

function borderColor(kind = 'default', theme = 'normal') {
  if (theme === 'solid') {
    return 'transparent';
  } else {
    return {
      gray: '#c1c1c1',
      red: '#e18f84'
    }[kind];
  }
}
function color(kind = 'default', theme = 'normal') {
  if (theme === 'solid') {
    return '#ffffff';
  } else {
    return {
      gray: '#333',
      red: '#cc3333'
    }[kind];
  }
}

export const Input = styled.input`
  background: #fff;
  border: solid 1px #c1c1c1;
  border-color: ${props => (props.hasError ? 'red' : '#ccc')};
  border-radius: 4px;
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  color: ${props => (props.hasError ? 'red' : '#555')};
  padding: 9px;
  width: 100%;
  display: block;
  &.extra-space-for-addon {
    padding-left: 48px;
  }
  &:hover {
    border-color: #8b8b8b;
  }
  &:focus {
    border-color: #64b8dc;
    box-shadow: none;
    outline: 0;
  }
  &[disabled] {
    background: #e5e5e5;
    border-color: #c1c1c1;
    box-shadow: none;
  }
  &::-webkit-input-placeholder {
    color: #999;
  }
  &:-moz-placeholder {
    color: #999;
  }
  &::-moz-placeholder {
    color: #999;
  }
  &:-ms-input-placeholder {
    color: #999;
  }
`;

export const Form = styled.form`
  display: table;
  margin: 0 auto;
  position: relative;
`;

export const FormRow = styled.div`
  align-items: ${props =>
    _.includes(['top', 'flex-start'], props.align) ? 'flex-start' : 'center'};
  display: flex;
  min-height: 50px;
  &:last-child {
    text-align: center;
    padding: 20px 0;
  }
  justify-content: ${props => props.align || 'flex-start'};
  ${media.mobile`
    display: block;
    text-align: left;
    margin-bottom: 10px;
    > span {
      display: block;
      font-size: 12px;
    }
  `};
`;

export const FormLabel = styled.label`
  display: inline-block;
  font-weight: bold;
  padding-top: ${props =>
    _.includes(['top', 'flex-start'], props.align) ? '10px' : '0'};
  padding-right: 15px;
  position: relative;
  text-align: right;
  width: 125px;
  ${props =>
    props.required &&
    `
    &:after {
      content: '*';
      color: #c00;
      position: absolute;
      right: 7px;
    }
  `};
  ${media.mobile`
    font-size: 13px;
    text-align: left;
    width: auto;
  `};
`;
