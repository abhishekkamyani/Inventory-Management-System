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
  XCircle,
  Package,
  Clock,
  ChevronDown,
  ChevronUp,
  User
} from 'lucide-react';
import { DatePicker, Select, Button, Table, Card, Spin, message, Row, Col } from 'antd';
import moment from 'moment';

const { RangePicker } = DatePicker;
const { Option } = Select;

export default function Reports() {
  const [reportType, setReportType] = useState('daily');
  const [dateRange, setDateRange] = useState([moment().startOf('day'), moment().endOf('day')]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [requisitions, setRequisitions] = useState([]);
  const [expandedRequisition, setExpandedRequisition] = useState(null);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const startDate = dateRange[0].toISOString();
      const endDate = dateRange[1].toISOString();
      const status = statusFilter === 'all' ? null : statusFilter;

      const { data } = await axios.get(
        'http://localhost:3000/api/reports/requisitions',
        { params: { startDate, endDate, status }, withCredentials: true }
      );

      setRequisitions(data.data || []);
      message.success(`Found ${data.data?.length || 0} requisitions`);
    } catch (error) {
      console.error('Error fetching report data:', error);
      message.error('Failed to fetch requisitions');
      setRequisitions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (reportType === 'daily') {
      setDateRange([moment().startOf('day'), moment().endOf('day')]);
    } else if (reportType === 'weekly') {
      setDateRange([moment().startOf('week'), moment().endOf('week')]);
    } else if (reportType === 'monthly') {
      setDateRange([moment().startOf('month'), moment().endOf('month')]);
    }
  }, [reportType]);

  const handleDateChange = (dates) => {
    if (dates && dates.length === 2) setDateRange(dates);
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      requisitions.map(req => ({
        'ID': req._id.slice(-6),
        'Requested By': req.user?.fullName || 'N/A',
        'Items': req.items.map(i => `${i.name} (x${i.quantity})`).join(', '),
        'Status': req.status,
        'Created': moment(req.createdAt).format('YYYY-MM-DD')
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, worksheet, 'Requisitions');
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buf], { type: 'application/octet-stream' }),
           `requisitions_${moment().format('YYYYMMDD_HHmmss')}.xlsx`);
  };

  const getBadge = (status) => {
    const base = 'px-2 py-1 rounded-full text-xs flex items-center';
    switch (status) {
      case 'Approved': return <span className={`${base} bg-green-100 text-green-800`}><CheckCircle className="mr-1 h-3 w-3"/>Approved</span>;
      case 'Rejected': return <span className={`${base} bg-red-100 text-red-800`}><XCircle className="mr-1 h-3 w-3"/>Rejected</span>;
      case 'Fulfilled': return <span className={`${base} bg-blue-100 text-blue-800`}><Package className="mr-1 h-3 w-3"/>Fulfilled</span>;
      default: return <span className={`${base} bg-yellow-100 text-yellow-800`}><Clock className="mr-1 h-3 w-3"/>Pending</span>;
    }
  };

  const columns = [
    { title: 'ID', dataIndex: '_id', key: 'id', width: 80, render: id => <code>{id.slice(-6)}</code> },
    { title: 'User', dataIndex: ['user','fullName'], key: 'user', render: (name) => <div className="flex items-center"><User className="mr-2" />{name}</div> },
    { title: 'Items', dataIndex: 'items', key: 'items', render: items => `${items.length}`, responsive: ['lg'] },
    { title: 'Status', dataIndex: 'status', key: 'status', render: getBadge, filters: [
        { text: 'Pending', value: 'Pending' },
        { text: 'Approved', value: 'Approved' },
        { text: 'Rejected', value: 'Rejected' },
        { text: 'Fulfilled', value: 'Fulfilled' },
      ], onFilter: (v, r) => r.status === v
    },
    { title: 'Date', dataIndex: 'createdAt', key: 'date', render: d => moment(d).format('MMM D, YYYY'), sorter: (a,b)=>new Date(a.createdAt)-new Date(b.createdAt) },
    { title: '', key: 'expand', render: (_,rec) => (
        <Button type="text" size="small" onClick={()=>setExpandedRequisition(expandedRequisition===rec._id?null:rec._id)}>
          { expandedRequisition===rec._id? <ChevronUp/> : <ChevronDown/> }
        </Button>
      )
    }
  ];

  return (
    <div className="p-4 sm:p-6">
      <Card className="w-full overflow-x-auto" title={<div className="flex items-center"><FileText className="mr-2"/>Requisitions Report</div>}>
        <Row gutter={[16,16]}> 
          <Col xs={24} sm={12} md={6}>
            <label className="block mb-1 text-sm">Type</label>
            <Select value={reportType} onChange={setReportType} suffixIcon={<Calendar/>} style={{ width: '100%' }}>
              <Option value="daily">Daily</Option>
              <Option value="weekly">Weekly</Option>
              <Option value="monthly">Monthly</Option>
              <Option value="custom">Custom</Option>
            </Select>
          </Col>

          <Col xs={24} sm={12} md={10}>
            <label className="block mb-1 text-sm">Date Range</label>
            <RangePicker
              value={dateRange}
              onChange={handleDateChange}
              disabled={reportType!=='custom'}
              style={{ width: '100%' }}
            />
          </Col>

          <Col xs={24} sm={12} md={5}>
            <label className="block mb-1 text-sm">Status</label>
            <Select value={statusFilter} onChange={setStatusFilter} suffixIcon={<Filter/>} style={{ width: '100%' }}>
              <Option value="all">All</Option>
              <Option value="Pending">Pending</Option>
              <Option value="Approved">Approved</Option>
              <Option value="Rejected">Rejected</Option>
              <Option value="Fulfilled">Fulfilled</Option>
            </Select>
          </Col>

          <Col xs={24} sm={12} md={3} className="flex items-end justify-end">
            <Button type="primary" block onClick={fetchReportData} loading={loading}>Generate</Button>
          </Col>
        </Row>

        { requisitions.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center my-4">
            <div className="text-sm text-gray-600 mb-2 sm:mb-0">
              {requisitions.length} records from {dateRange[0].format('MMM D')} to {dateRange[1].format('MMM D, YYYY')}
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button icon={<Download/>} block={false} onClick={exportToExcel}>Excel</Button>
              <Button icon={<Printer/>} block={false} onClick={()=>window.print()}>Print</Button>
            </div>
          </div>
        )}

        <div>
          { loading ? (
            <div className="text-center py-8"><Spin size="large"/></div>
          ) : requisitions.length>0 ? (
            <Table
              columns={columns}
              dataSource={requisitions}
              rowKey="_id"
              pagination={{ pageSize: 10, responsive: true }}
              scroll={{ x: 'max-content' }}
              expandable={{
                expandedRowRender: record => (
                  <div className="p-4 bg-gray-50 rounded">
                    <Row gutter={[16,16]}> 
                      <Col xs={24} md={12}>
                        <h5 className="font-medium mb-2">Request Info</h5>
                        <p><strong>By:</strong> {record.user?.fullName}</p>
                        <p><strong>At:</strong> {moment(record.createdAt).format('lll')}</p>
                      </Col>
                      <Col xs={24} md={12}>
                        <h5 className="font-medium mb-2">Items</h5>
                        { record.items.map((it,i)=>(
                          <p key={i}>{it.name} x{it.quantity}</p>
                        )) }
                      </Col>
                    </Row>
                    { record.rejectionReason && (
                      <div className="mt-4 p-3 bg-red-50 rounded">
                        <strong>Rejection:</strong> {record.rejectionReason}
                      </div>
                    ) }
                  </div>
                ),
                rowExpandable: () => true,
                expandedRowKeys: expandedRequisition?[expandedRequisition]:[]
              }}
            />
          ) : (
            <div className="text-center p-8 text-gray-500">
              {loading? null : 'No data — generate a report.'}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
