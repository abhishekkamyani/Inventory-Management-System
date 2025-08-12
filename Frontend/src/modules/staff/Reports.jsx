import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Filter,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  User,
  Box
} from 'lucide-react';
import { DatePicker, Button, Card, Spin, message, Row, Col, Badge } from 'antd';
import moment from 'moment';

const { RangePicker } = DatePicker;

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
      //message.success(`Found ${data.data?.length || 0} fulfilled requisitions`);
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

  useEffect(() => {
    fetchFulfilledRequisitions();
  }, []);

  return (
    <div className="p-4">
      <Card 
        className="w-full" 
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

        <div className="mt-4">
          {loading ? (
            <div className="text-center py-8">
              <Spin size="large" />
            </div>
          ) : requisitions.length > 0 ? (
            <div className="space-y-3">
              {requisitions.map(requisition => (
                <Card 
                  key={requisition._id} 
                  className="w-full hover:shadow-md transition-shadow"
                >
                  <div 
                    className="flex justify-between items-start cursor-pointer"
                    onClick={() => setExpandedRequisition(
                      expandedRequisition === requisition._id ? null : requisition._id
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center mb-1">
                        <User className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="font-medium truncate">
                          {requisition.user?.fullName || 'Unknown User'}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="mr-2">
                          {moment(requisition.fulfilledAt).format('MMM D, YYYY')}
                        </span>
                        <Badge 
                          count={`${requisition.items.reduce((sum, item) => sum + item.quantity, 0)} items`}
                          className="bg-blue-100 text-blue-800"
                        />
                      </div>
                    </div>
                    <div className="flex items-center ml-2">
                      <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 flex items-center mr-2">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Fulfilled
                      </span>
                      {expandedRequisition === requisition._id ? (
                        <ChevronUp className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                  </div>

                  {expandedRequisition === requisition._id && (
                    <div className="mt-4 pt-4 border-t">
                      <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12}>
                          <h5 className="font-medium mb-2">Request Details</h5>
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className="text-gray-600">Requested By:</span>{' '}
                              {requisition.user?.fullName} ({requisition.user?.email})
                            </p>
                            <p>
                              <span className="text-gray-600">Request Date:</span>{' '}
                              {moment(requisition.createdAt).format('lll')}
                            </p>
                            <p>
                              <span className="text-gray-600">Fulfilled On:</span>{' '}
                              {moment(requisition.fulfilledAt).format('lll')}
                            </p>
                          </div>
                        </Col>
                        <Col xs={24} sm={12}>
                          <h5 className="font-medium mb-2">Items Fulfilled</h5>
                          <div className="space-y-2">
                            {requisition.items.map((item, index) => (
                              <div key={index} className="flex items-center text-sm">
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
                  )}
                </Card>
              ))}
            </div>
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