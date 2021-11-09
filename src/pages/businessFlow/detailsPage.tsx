/**
 * @author chuxu
 */
import { Button, Row, Tooltip } from 'antd';
import { ColumnProps } from 'antd/lib/table';
import {
  CommonSelect,
  ImportFile,
  useCreateContext,
  useStateReducer
} from 'racc';
import React, { Fragment, useEffect } from 'react';
import CustomDetailHeader from 'src/common/custom-detail-header.tsx';
import CustomIcon from 'src/common/custom-icon/CustomIcon';
import ImportFileModal from 'src/common/import-file-modal/ImportFileModal';
import CustomTable from 'src/components/custom-table';
import { customColumnProps } from 'src/components/custom-table/utils';
import { MainPageLayout } from 'src/components/page-layout';
import { Link, router } from 'umi';
import styles from './index.less';
import AddJmeterModal from './modals/AddJmeterModal';
import DebugScriptModal from './modals/DebugScriptModal';
import MatchModal from './modals/MatchModal';
import BusinessFlowService from './service';

interface Props {
  location?: any;
}
const getInitState = () => ({
  threadGroupList: null, // 线程组列表
  threadValue: undefined, // 默认线程组
  treeData: null,
  threadDetail: {} as any,
  visible: false,
  detailData: {} as any,
  fileModalValues: {
    fileTitle: '业务活动匹配',
    status: 'loading',
    footerBtnTxt: '取消',
    footerTxt: '业务活动匹配中，请稍后',
    extraNode: null
  },
  fileName: 'jingsai '
});
export const BusinessFlowDetailContext = useCreateContext<
  BusinessFlowDetailState
>();
export type BusinessFlowDetailState = ReturnType<typeof getInitState>;
const BusinessFlowDetail: React.FC<Props> = props => {
  const [state, setState] = useStateReducer(getInitState());
  const { fileModalValues, detailData, threadDetail } = state;
  const { location } = props;
  const { query } = location;
  const { id, isAuto } = query;

  useEffect(() => {
    if (isAuto === 'true') {
      queryMatchProcess();
    }
  }, []);

  useEffect(() => {
    if (id) {
      queryDetail();
    }
  }, []);

  useEffect(() => {
    if (state.threadValue && id) {
      queryTreeData();
    }
  }, [state.threadValue]);

  /**
   * @name 获取业务流程详情,获取线程组列表
   */
  const queryDetail = async () => {
    const {
      data: { success, data }
    } = await BusinessFlowService.queryDetail({ id });
    if (success) {
      setState({
        detailData: data,
        threadGroupList: data.scriptJmxNodeList,
        threadValue:
          data.scriptJmxNodeList &&
          data.scriptJmxNodeList[0] &&
          data.scriptJmxNodeList[0].value
      });
    }
  };

  /**
   * @name 获取线程组内容详情
   */
  const queryTreeData = async () => {
    const {
      data: { success, data }
    } = await BusinessFlowService.queryTreeData({
      id,
      xpathMd5: state.threadValue
    });
    if (success) {
      setState({
        treeData: data.threadScriptJmxNodes,
        threadDetail: data
      });
    }
  };

  /**
   * @name 获取匹配进度
   */
  const queryMatchProcess = async () => {
    setState({
      visible: true,
      fileModalValues: {
        fileTitle: '业务活动匹配',
        status: 'loading',
        footerBtnTxt: '取消',
        footerTxt: '业务活动匹配中，请稍后',
        extraNode: null
      },
      fileName: detailData.businessProcessName
    });
    const {
      data: { success, data }
    } = await BusinessFlowService.queryMatchProcess({ id });
    if (success) {
      setState({
        fileModalValues: {
          fileTitle: '业务活动匹配',
          status: 'success',
          footerBtnTxt: '完成',
          footerTxt: `本次匹配完成，时间：${data.finishDate}`,
          extraNode: (
            <p>
              本次共自动匹配 <span>{data.matchNum}</span> 条API,剩{' '}
              <span>{data.unMatchNum}</span>条手动匹配
            </p>
          )
        }
      });
      queryDetail();
    }
  };

  const handleChangeThread = value => {
    setState({
      threadValue: value
    });
  };
  const getColumns = (): ColumnProps<any>[] => {
    const columns: ColumnProps<any>[] = [
      {
        ...customColumnProps,
        title: '调用树',
        dataIndex: 'testName',
        ellipsis: true,
        width: 300,
        render: text => {
          return (
            <span>
              <Tooltip placement="bottomLeft" title={text}>
                <span>{text}</span>
              </Tooltip>
            </span>
          );
        }
      },
      {
        ...customColumnProps,
        title: '入口应用',
        dataIndex: 'businessApplicationName',
        width: 150
      },
      {
        ...customColumnProps,
        title: '入口',
        dataIndex: 'serviceName',
        width: 150,
        render: text => {
          return text ? (
            <Tooltip
              placement="bottomLeft"
              title={
                <div style={{ maxHeight: 300, overflow: 'scroll' }}>
                  {/* <div style={{ textAlign: 'right' }}>
                    <a onClick={() => handleCopy(text)}>复制</a>
                  </div> */}
                  {text}
                </div>}
            >
              <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {text}
              </div>
            </Tooltip>
          ) : (
            <span>-</span>
          );
        }
      },

      {
        ...customColumnProps,
        title: '状态',
        dataIndex: 'totalCost',
        width: 100
      },
      {
        ...customColumnProps,
        title: '操作',
        dataIndex: 'startTime',
        width: 150,
        render: (text, row) => {
          if (row.type === 'SAMPLER') {
            return (
              <MatchModal
                rowDetail={row}
                btnText="编辑匹配"
                apiName={row.testName}
                path={row.identification}
                isVirtual={row.businessType}
                entranceApp={row.businessApplicationName}
                entrancePath={row.entrace}
                samplerType={row.samplerType}
                onSuccess={() => queryTreeData()}
              />
            );
          }
          return '-';
        }
      }
    ];
    return columns;
  };

  return (
    <BusinessFlowDetailContext.Provider value={{ state, setState }}>
      <MainPageLayout>
        <div className={styles.borders}>
          <CustomDetailHeader
            title={detailData.businessProcessName}
            description={
              <p>
                <span>线程总数：</span>
                <span>{detailData.threadGroupNum}</span>
                <span style={{ marginLeft: 20 }}>匹配进度：</span>
                <span>{detailData.linkRelateNum}</span>/
                <span>{detailData.totalNodeNum}</span>
              </p>
            }
            img={
              <CustomIcon
                imgWidth={28}
                color="#11D0C5"
                imgName="redis_icon"
                iconWidth={64}
              />
            }
            extra={
              <div style={{ float: 'right' }}>
                <DebugScriptModal
                  btnText="调试"
                  id={id}
                  state={state}
                  setState={setState}
                />
                <Button>管理文件</Button>
                <AddJmeterModal
                  btnText="管理脚本"
                  action="edit"
                  fileList={detailData.scriptFile}
                  id={detailData.id}
                />

                {/* <Dropdown overlay={menu} placement="bottomLeft">
                  <Button type="primary">新增</Button>
                </Dropdown> */}
              </div>}
          />
        </div>
        <div style={{ marginTop: 20 }}>
          <Row type="flex" justify="space-between" align="middle">
            <CommonSelect
              style={{ width: 150 }}
              dataSource={state.threadGroupList || []}
              value={state.threadValue}
              onChange={handleChangeThread}
              allowClear={false}
            />
            <span>
              当前线程组匹配进度：
              <span>{threadDetail.linkRelateNum}</span>
              <span>/</span>
              <span>{threadDetail.totalNodeNum}</span>
            </span>
          </Row>
          {state.treeData && (
            <CustomTable
              rowKey="id"
              columns={getColumns()}
              size="small"
              dataSource={state.treeData}
              defaultExpandAllRows={true}
              childrenColumnName="children"
            />
          )}
        </div>
        <ImportFileModal
          onCancel={() => {
            queryDetail();
            setState({
              fileModalValues: {
                fileTitle: null,
                status: 'loading',
                footerTxt: null,
                extraNode: null,
                footerBtnTxt: null
              },
              visible: false
            });
          }}
          fileName={state.fileName}
          fileTitle={fileModalValues.fileTitle}
          visible={state.visible}
          extraNode={fileModalValues.extraNode}
          status={fileModalValues.status}
          footerTxt={fileModalValues.footerTxt}
          footerBtnTxt={fileModalValues.footerBtnTxt}
          onBtnClick={() => {
            queryDetail();
            setState({
              visible: false,
              fileModalValues: {
                fileTitle: null,
                status: null,
                footerTxt: null,
                extraNode: null,
                footerBtnTxt: null
              }
            });
            router.push(`/businessFlow/details?id=${id}`);
          }}
        />
      </MainPageLayout>
    </BusinessFlowDetailContext.Provider>
  );
};
export default BusinessFlowDetail;
