/**
 * transform: true
 * inline: true
 */

import 'antd/dist/antd.min.css';
import 'drip-table/dist/index.css';
import './index.css';

import { CloudSyncOutlined } from '@ant-design/icons';
import { Button, message } from 'antd';
import DripTable, { DripTableFilters, DripTableInstance } from 'drip-table';
import DripTableDriverAntDesign from 'drip-table-driver-antd';
import React from 'react';

import { initSchema, mockData, SampleRecordType, SampleSubtableDataSourceKey } from './demo-data';
import { CustomComponentEvent, CustomComponents, CustomColumnSchema } from './custom-components';
import { useState } from '../hooks';

const Demo = () => {
  const [state, setState] = useState({
    loading: false,
    filters: (void 0) as { key: string; values: unknown[] }[] | undefined,
    pageNum: 1,
    pageSize: 10,
    dataBase: mockData,
    totalNum: mockData.length,
    dataSource: mockData,
    schema: initSchema,
    allSelected: false,
  });

  const dripTable: React.MutableRefObject<DripTableInstance | null> = React.useRef(null);

  React.useEffect(
    () => {
      setState({ dataBase: mockData });
    },
    [],
  );

  React.useEffect(
    () => {
      const filteredDataSource = state.dataBase.filter(ds => !state.filters?.length || state.filters.some(f => f.values?.includes(ds[f.key])));
      const pageNum = state.pageNum;
      const pageSize = state.pageSize;
      setState({ totalNum: filteredDataSource.length });
      setState({ dataSource: filteredDataSource.slice((pageNum - 1) * pageSize, Math.min(pageNum * pageSize, filteredDataSource.length)) });
    },
    [state.dataBase, state.filters, state.pageSize, state.pageNum],
  );

  const fetchPageData = (nextFilters: DripTableFilters, nextPageSize: number, nextPageNum: number) => {
    if (state.loading) {
      return;
    }
    setTimeout(
      () => {
        setState({
          loading: false,
          filters: Array.isArray(nextFilters)
            ? Object.entries(nextFilters)
              .map(([key, values]) => ({ key, values }))
            : [],
          pageSize: nextPageSize,
          pageNum: nextPageNum,
        });
      },
      500,
    );
    setState({ loading: true });
  };

  function selectAllRecord() {
    const tableInstance = dripTable.current;
    const allKeys = state.dataSource.map((rec, idx) => idx);
    if (tableInstance) {
      const selectedKeys = tableInstance.selectedRowKeys;
      if (selectedKeys.length < allKeys.length) {
        tableInstance.select(allKeys);
        setState({ allSelected: true });
      } else {
        tableInstance.select([]);
        setState({ allSelected: false });
      }
    }
  }

  return (
    <div className="demo-wrapper">
      <DripTable<SampleRecordType, {
        CustomColumnSchema: CustomColumnSchema;
        CustomComponentEvent: CustomComponentEvent;
        SubtableDataSourceKey: SampleSubtableDataSourceKey;
      }>
        ref={dripTable}
        driver={DripTableDriverAntDesign}
        schema={state.schema}
        loading={state.loading}
        total={state.totalNum}
        dataSource={state.dataSource}
        components={{ custom: CustomComponents }}
        slots={{
          'select-all': (props) => (
            <Button className={props.className} style={{ marginRight: '5px' }} type="primary" onClick={selectAllRecord}>
              { state.allSelected && '??????' }
              ??????
            </Button>
          ),
        }}
        subtableTitle={(record, index, parent, subtable) => <div style={{ textAlign: 'center' }}>{ `?????????(id:${parent.id})?????????${record.name}???????????? ???${subtable.dataSource.length} ??????` }</div>}
        subtableFooter={(record, index, parent, subtable) => (
          subtable.id === 'sample-table-sub-level-1'
            ? (
              <div
                style={{ cursor: 'pointer', textAlign: 'center', userSelect: 'none' }}
                onClick={() => {
                  message.info(`?????????????????????(id:${parent.id})?????????${record.name}???(${index})???????????????????????? ${subtable.dataSource.length} ???`);
                  console.log('expandable-footer-click', record, index, parent, subtable);
                }}
              >
                <CloudSyncOutlined />
                <span style={{ marginLeft: '5px' }}>????????????</span>
              </div>
            )
            : void 0
        )}
        rowExpandable={(record, parent) => parent.id === 'sample-table' && record.id === 5}
        expandedRowRender={(record, index, parent) => (<div style={{ textAlign: 'center', margin: '20px 0' }}>{ `?????????(id:${parent.id})?????????${record.name}???????????????????????????` }</div>)}
        onEvent={(event, record, index) => {
          if (event.type === 'drip-link-click') {
            const name = event.payload;
            message.info(`???????????????${index + 1}??????${record.name} (ID: ${record.id})?????????${name}??????????????????`);
            console.log(name, record, index);
          } else if (event.type === 'custom') {
            message.info(`??????????????????${event.name}??????????????????${record.name} (ID: ${record.id})????????????????????????`);
            console.log(event, record, index);
          }
        }}
        onFilterChange={(...args) => { console.log('onFilterChange', ...args); }}
        onPageChange={(...args) => { console.log('onPageChange', ...args); }}
        onChange={({ pagination, filters }) => {
          console.log('onChange', pagination, filters);
          fetchPageData(filters, pagination.pageSize ?? state.pageSize, pagination.current ?? state.pageNum);
        }}
        onSelectionChange={(selectedKeys, selectedRows) => {
          setState({ allSelected: selectedRows.length >= state.dataSource.length });
        }}
        onSearch={searchParams => console.log(searchParams)}
        onInsertButtonClick={event => console.log(event)}
      />
    </div>
  );
};

export default Demo;
