import Head from 'next/head';
import React from 'react';
import ToggleBotAI from '../botAI/components/ToggleBotAI';
import BarChartHorizontal from './components/newCharts/BarChartHorizontal';
import BarChartVertical from './components/newCharts/BarChartVertical';
import ListMaterial from './components/newCharts/ListMaterial';
import ListProgress from './components/newCharts/ListProgress';
import PieChartNew from './components/newCharts/PieChartNew';
import ProgressPath from './components/ProgressPath';

const Dashboard = props => {
  const { dataLang } = props;

  return (
    <React.Fragment>
      <Head>
        <title>Tổng quan</title>
      </Head>

      <div className='py-6 flex flex-col gap-6 bg-[#FDFDFE] min-h-screen pt-[96px] relative'>
        <div className='relative'>
          <div className='absolute -top-[46px] left-0 w-full h-[60px] bg-[#FDFDFE]  z-10'></div>
          <ProgressPath />
        </div>

        {/* <TopProducts /> */}
        <div className='flex flex-col md:flex-row gap-6 px-4 md:px-6'>
          <BarChartVertical />
          <BarChartHorizontal />
        </div>
        <div className='grid grid-cols-1 std:grid-cols-3 gap-6 px-4 md:px-6'>
          <div className='col-span-1 std:col-span-1'>
            <PieChartNew />
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 std:col-span-2'>
            <ListProgress />
            <ListMaterial />
          </div>
        </div>

        <div className='fixed bottom-12 right-6 z-[9999]'>
          <ToggleBotAI dataLang={dataLang} />
        </div>
      </div>
    </React.Fragment>
  );
};

export default Dashboard;
