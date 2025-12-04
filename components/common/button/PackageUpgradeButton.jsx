import React from 'react';
import ButtonAnimationNew from './ButtonAnimationNew';
import { UpgradeIcon } from '@/components/icons';
import { useDispatch } from 'react-redux';
import { useGetUpgradePackage } from '@/hooks/useAuth';
import PopupUpgradeProfessional from '@/components/UI/popup/PopupUpgradeProfessional';

const PackageUpgradeButton = () => {
  const dispatch = useDispatch();

  const { data: upgradePackageData } = useGetUpgradePackage();

  const handleUpdatePackage = () => {
    dispatch({
      type: 'statePopupGlobal',
      payload: {
        open: true,
        children: (
          <PopupUpgradeProfessional
            upgradePackageData={upgradePackageData}
            onClose={() => {
              dispatch({
                type: 'statePopupGlobal',
                payload: { open: false },
              });
            }}
          />
        ),
      },
    });
  };

  return (
    <div className='border-gradient-button-foso-always rounded-[8px]'>
      <ButtonAnimationNew
        icon={<UpgradeIcon className='text-white text-[15px]' size={15} />}
        classNameWithIcon='space-x-2'
        reverse={false}
        title='Nâng cấp Pro'
        className='px-4 py-2 w-full text-white responsive-text-lg font-medium rounded-[8px] text-center flex items-center justify-center transition-colors duration-300 ease-in-out upgrade-button-animated'
        style={{
          background: `linear-gradient(to bottom right, #1FC583 0%, #1F9285 100%)`,
        }}
        whileHover={{
          background: [
            'radial-gradient(100% 100% at 50% 0%, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 100%), linear-gradient(0deg, #1AD598, #1AD598)',
            'radial-gradient(100% 100% at 50% 0%, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.3) 100%), linear-gradient(0deg, #1AD598, #1AD598)',
            'radial-gradient(100% 100% at 50% 0%, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 100%), linear-gradient(0deg, #1AD598, #1AD598)',
            ,
          ],
          transition: {
            duration: 1.5,
            ease: [0.4, 0, 0.6, 1],
            repeat: Infinity,
          },
          boxShadow: [
            'inset -2px -2px 5px rgba(255,255,255,0.5), inset 2px 2px 4px rgba(0,0,0,0.15)',
            'inset -3px -3px 6px rgba(255,255,255,0.7), inset 3px 3px 6px rgba(0,0,0,0.35)',
            'inset -3px -3px 7px rgba(255,255,255,0.7), inset 3px 3px 7px rgba(0,0,0,0.4)',
            'inset -2px -2px 5px rgba(255,255,255,0.5), inset 2px 2px 4px rgba(0,0,0,0.3)',
          ],
        }}
        onClick={handleUpdatePackage}
      />
    </div>
  );
};

export default PackageUpgradeButton;
