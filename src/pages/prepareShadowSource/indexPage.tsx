import React, { useState, useEffect, createContext, useContext } from 'react';
import { Layout } from 'antd';
import Introduce from './components/Introduce';
import List from './components/List';
import SelectTypeModal from './modals/SelectTypeModal';
import Detail from './components/Detail';

export const PrepareContext = createContext(null);

export default (props) => {
  const [prepareState, setFullPrepareState] = useState({
    currentLink: null,
  });
  const setPrepareState = (particalState) => {
    setFullPrepareState({
      ...prepareState,
      ...particalState,
    });
  };
  return (
    <PrepareContext.Provider value={{ prepareState, setPrepareState }}>
      <Layout>
        <Layout.Sider
          width={260}
          theme="light"
          style={{ borderRight: '1px solid var(--Netural-100, #EEF0F2)' }}
        >
          <List />
        </Layout.Sider>
        <Layout.Content style={{ background: '#fff' }}>
          {!prepareState.currentLink?.id ? <Introduce /> : <Detail />}
          <SelectTypeModal
            detail={prepareState.currentLink}
            cancelCallback={() => setPrepareState({ currentLink: null })}
          />
        </Layout.Content>
      </Layout>
    </PrepareContext.Provider>
  );
};
