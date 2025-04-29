// src/modules/staff/Reports.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Filter,
  CheckCircle,
  Package,
  ChevronDown,
  ChevronUp,
  User,
  Box
} from 'lucide-react';
import { DatePicker, Select, Button, Table, Card, Spin, message, Row, Col, Badge } from 'antd';
import moment from 'moment';

const { RangePicker } = DatePicker;
const { Option } = Select;

const Reports = () => {
  const [dateRange, setDateRange] = useState([moment().subtract(1, 'month'), moment()]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [requisitions, setRequisitions] = useState([]);
  const [expandedRequisition, setExpandedRequisition] = useState(null);

  const fetchFulfilledRequisitions = async () => {
    try {
      setLoading(true);
      const params = {
        startDate: dateRange[0].toISOString(),
        endDate: dateRange[1].toISOString()
      };

      const { data } = await axios.get(
        'http://localhost:3000/api/requisitions/staff/fulfilled',
        { params, withCredentials: true }
      );

      setRequisitions(data.data || []);
      message.success(`Found ${data.data?.length || 0} fulfilled requisitions`);
    } catch (error) {
      console.error('Error fetching fulfilled requisitions:', error);
      message.error('Failed to fetch requisitions');
      setRequisitions([]);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async () => {
    try {
      setExporting(true);
      const params = {
        startDate: dateRange[0].toISOString(),
        endDate: dateRange[1].toISOString(),
        format: 'excel'
      };

      const response = await axios.get(
        'http://localhost:3000/api/requisitions/staff/export',
        { 
          params,
          responseType: 'blob',
          withCredentials: true 
        }
      );

      const filename = `fulfilled_requisitions_${moment().format('YYYYMMDD')}.xlsx`;
      saveAs(new Blob([response.data]), filename);
      message.success('Report exported successfully');
    } catch (error) {
      console.error('Error exporting report:', error);
      message.error('Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  const handleDateChange = (dates) => {
    if (dates && dates.length === 2) setDateRange(dates);
  };

  const columns = [
    { 
      title: 'ID', 
      dataIndex: '_id', 
      key: 'id', 
      width: 80, 
      render: id => <code>{id.toString().slice(-6)}</code> 
    },
    { 
      title: 'Requested By', 
      dataIndex: ['user', 'fullName'], 
      key: 'user', 
      render: (name) => (
        <div className="flex items-center">
          <User className="mr-2 h-4 w-4" />
          {name}
        </div>
      ) 
    },
    { 
      title: 'Items', 
      dataIndex: 'items', 
      key: 'items', 
      render: items => (
        <Badge 
          count={items.reduce((sum, item) => sum + item.quantity, 0)} 
          showZero 
          className="bg-blue-100 text-blue-800"
        />
      ),
      responsive: ['md'] 
    },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status', 
      render: () => (
        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 flex items-center">
          <CheckCircle className="mr-1 h-3 w-3" />
          Fulfilled
        </span>
      ) 
    },
    { 
      title: 'Fulfilled Date', 
      dataIndex: 'fulfilledAt', 
      key: 'date', 
      render: d => moment(d).format('MMM D, YYYY'), 
      sorter: (a,b) => new Date(a.fulfilledAt) - new Date(b.fulfilledAt) 
    },
    { 
      title: '', 
      key: 'expand', 
      render: (_, rec) => (
        <Button 
          type="text" 
          size="small" 
          onClick={() => setExpandedRequisition(expandedRequisition === rec._id ? null : rec._id)}
        >
          { expandedRequisition === rec._id ? <ChevronUp /> : <ChevronDown /> }
        </Button>
      )
    }
  ];

  useEffect(() => {
    fetchFulfilledRequisitions();
  }, []);

  return (
    <div className="p-4 sm:p-6">
      <Card 
        className="w-full overflow-x-auto" 
        title={
          <div className="flex items-center">
            <FileText className="mr-2" />
            <span>My Fulfilled Requisitions</span>
          </div>
        }
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={16} md={12}>
            <label className="block mb-1 text-sm">Date Range</label>
            <RangePicker
              value={dateRange}
              onChange={handleDateChange}
              style={{ width: '100%' }}
              ranges={{
                'This Month': [moment().startOf('month'), moment().endOf('month')],
                'Last Month': [
                  moment().subtract(1, 'month').startOf('month'),
                  moment().subtract(1, 'month').endOf('month')
                ],
                'Last 3 Months': [moment().subtract(3, 'months'), moment()],
              }}
            />
          </Col>

          <Col xs={24} sm={8} md={6} className="flex items-end">
            <Button 
              type="primary" 
              block 
              onClick={fetchFulfilledRequisitions} 
              loading={loading}
            >
              Filter
            </Button>
          </Col>

          <Col xs={24} sm={24} md={6} className="flex items-end justify-end">
            <Button 
              icon={<Download />} 
              onClick={exportReport}
              loading={exporting}
              className="w-full sm:w-auto"
            >
              Export Report
            </Button>
          </Col>
        </Row>

        {requisitions.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center my-4">
            <div className="text-sm text-gray-600 mb-2 sm:mb-0">
              Showing {requisitions.length} fulfilled requisitions between {dateRange[0].format('MMM D, YYYY')} and {dateRange[1].format('MMM D, YYYY')}
            </div>
            <Button 
              icon={<Printer />} 
              onClick={() => window.print()}
              className="w-full sm:w-auto"
            >
              Print
            </Button>
          </div>
        )}

        <div>
          {loading ? (
            <div className="text-center py-8">
              <Spin size="large" />
            </div>
          ) : requisitions.length > 0 ? (
            <Table
              columns={columns}
              dataSource={requisitions}
              rowKey="_id"
              pagination={{ pageSize: 10, responsive: true }}
              scroll={{ x: 'max-content' }}
              expandable={{
                expandedRowRender: record => (
                  <div className="p-4 bg-gray-50 rounded">
                    <Row gutter={[16, 16]}>
                      <Col xs={24} md={12}>
                        <h5 className="font-medium mb-2">Request Details</h5>
                        <p>
                          <strong>Requested By:</strong> {record.user?.fullName} ({record.user?.email})
                        </p>
                        <p>
                          <strong>Request Date:</strong> {moment(record.createdAt).format('lll')}
                        </p>
                        <p>
                          <strong>Fulfilled On:</strong> {moment(record.fulfilledAt).format('lll')}
                        </p>
                      </Col>
                      <Col xs={24} md={12}>
                        <h5 className="font-medium mb-2">Items Fulfilled</h5>
                        <div className="space-y-2">
                          {record.items.map((item, index) => (
                            <div key={index} className="flex items-center">
                              <Box className="mr-2 h-4 w-4 text-gray-500" />
                              <span>
                                {item.item?.name || 'Unknown Item'} × {item.quantity}
                              </span>
                            </div>
                          ))}
                        </div>
                      </Col>
                    </Row>
                  </div>
                ),
                rowExpandable: () => true,
                expandedRowKeys: expandedRequisition ? [expandedRequisition] : []
              }}
            />
          ) : (
            <div className="text-center p-8 text-gray-500">
              {loading ? null : 'No fulfilled requisitions found for the selected period'}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Reports;