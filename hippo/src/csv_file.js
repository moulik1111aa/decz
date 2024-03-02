// CSVConverter.js
import React from 'react';

class CSVConverter extends React.Component {
  convertToCSV = () => {
    const csvContent = this.convertObjectToCSV(this.props.formData);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'formData.csv');
    document.body.appendChild(link);
    link.click();
    window.URL.revokeObjectURL(url);
  }

  convertObjectToCSV = (data) => {
    const headers = Object.keys(data);
    const values = headers.map(header => data[header]);
    const csvRows = [headers.join(','), values.join(',')];
    return csvRows.join('\n');
  }

  render() {
    return (
      <button onClick={this.convertToCSV}>Download CSV</button>
    );
  }
}

export default CSVConverter;