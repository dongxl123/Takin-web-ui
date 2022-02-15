import React, { Fragment, useEffect } from 'react';
import styles from './index.less';
import { Alert } from 'antd';
import SwitchBar from './components/SwitchBar';
import { useStateReducer } from 'racc';
import AppManageService from 'src/pages/appManage/service';
import SwitchExplanationDrawer from './components/SwitchExplanationDrawer';
import SkeletonLoading from 'src/common/loading/SkeletonLoading';
import WhitelistSwitchService from './service';
interface Props {}
interface State {
  isReload: false;
  switchStatus: string;
  statusInfo: string;
  dataSource: any;
  loading: boolean;
}
const WhitelistSwitch: React.FC<Props> = props => {
  const [state, setState] = useStateReducer<State>({
    isReload: false,
    switchStatus: null,
    statusInfo: '',
    dataSource: [],
    loading: false
  });

  useEffect(() => {
    querySwitchStatus();
  }, [state.isReload]);

  /**
   * @name 获取白名单开关状态
   */
  const querySwitchStatus = async () => {
    setState({
      loading: true
    });
    const {
      data: { data, success }
    } = await WhitelistSwitchService.queryWhitelistSwitchStatus({});
    if (success) {
      setState({
        switchStatus: data.switchFlag,
        statusInfo:
          data.switchFlag === 1
            ? '白名单校验已开启，请在应用配置中将需要压测的接口加入白名单'
            : '白名单校验已关闭，请注意压测流量泄露风险！',
        loading: false
      });
    }
    setState({
      loading: false
    });
  };
  return state.loading ? (
    <SkeletonLoading />
  ) : (
    <div style={{ padding: '24px 16px' }}>
      <div className={styles.title}>白名单校验开关</div>
      <Alert
        type="warning"
        message={
          <div style={{ color: '#646676' }}>
            风险操作！操作前请仔细阅读
            <SwitchExplanationDrawer />
          </div>}
        showIcon
        style={{ marginTop: 40, marginBottom: 10 }}
      />
      <SwitchBar state={state} setState={setState} />
    </div>
  );
};
export default WhitelistSwitch;
