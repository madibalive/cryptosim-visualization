import React from 'react';

class Select extends React.Component {

  onChange(e) {
    e.preventDefault();
    this.props.onChange(e.target.value);
  }

  render() {
    const options = this.props.options.map(
      o => <option key={o.value} value={o.value}>{o.label}</option>)
    return (
      <select value={this.props.selectedValue} onChange={this.onChange.bind(this)}>
        {options}
      </select>
    )
  }
}

export default Select;