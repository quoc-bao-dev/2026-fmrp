import { UserPlusIcon } from '@/components/icons';
import AvatarText from '@/components/UI/common/user/AvatarText';
import { IMAGES } from '@/constants/images';
import { Tooltip } from 'antd';
import Image from 'next/image';
import { useMemo } from 'react';

const Avatar = ({ group_members_assigned, staffs_assigned, onClick }) => {
  // Transform staffs_assigned và group_members_assigned thành format thống nhất
  const avatarList = useMemo(() => {
    const list = [];

    // Thêm nhân viên
    (staffs_assigned || []).forEach(staff => {
      list.push({
        id: String(staff?.staffid),
        name: staff?.full_name || '',
        profile_image: staff?.profile_image || null,
        type: 'staff',
      });
    });

    // Thêm nhóm (transform từ cấu trúc group_members_assigned)
    (group_members_assigned || []).forEach(group => {
      list.push({
        id: `group_${group?.id}`,
        name: group?.name || '',
        profile_image: null, // Nhóm không có profile_image, sẽ dùng icon nhóm
        type: 'group',
      });
    });

    return list;
  }, [staffs_assigned, group_members_assigned]);

  if (avatarList.length === 0) {
    return (
      <Tooltip title='Thêm người phụ trách' placement='top'>
        <button
          className='cursor-pointer flex items-center justify-start w-fit p-1.5 rounded-lg border border-[#003DA0] hover:bg-[#EBF5FF] transition-colors'
          onClick={e => {
            e.stopPropagation();
            onClick?.();
          }}
        >
          <UserPlusIcon className='size-5 text-[#11315B]' />
        </button>
      </Tooltip>
    );
  }

  const isSingle = avatarList.length === 1;
  const maxDisplay = 10;
  const displayAvatars = avatarList.slice(0, maxDisplay);
  const remainingCount = avatarList.length > maxDisplay ? avatarList.length - maxDisplay : 0;

  return (
    <div
      className='flex items-center gap-2 justify-between w-fit cursor-pointer hover:opacity-80 transition-opacity group'
      onClick={e => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      <div className='p-1 flex items-center gap-1 rounded-full bg-[#D6EAFE]'>
        {displayAvatars.map((item, index) => {
          const isFirst = index === 0;
          const hasImage = item?.profile_image && item.profile_image.trim() !== '';
          const itemName = item?.name || 'Chưa có tên';
          const isGroup = item?.type === 'group';

          return (
            <Tooltip key={item?.id || index} title={itemName} placement='top'>
              {hasImage ? (
                <Image
                  src={item.profile_image}
                  alt={itemName}
                  width={100}
                  height={100}
                  className={`size-[30px] bg-[#E2E5E9] rounded-full overflow-hidden object-cover border-2 border-[#549AE8] ${isFirst ? '' : '-ml-3'} z-1 cursor-pointer`}
                />
              ) : isGroup ? (
                <Image
                  src={IMAGES.groupUser}
                  alt={itemName}
                  width={100}
                  height={100}
                  className={`size-[30px] bg-[#E2E5E9] rounded-full overflow-hidden object-cover border-2 border-[#549AE8] ${isFirst ? '' : '-ml-3'} z-1 cursor-pointer`}
                />
              ) : (
                <div
                  className={`size-[30px] rounded-full overflow-hidden border-2 border-[#549AE8] flex items-center justify-center bg-white ${isFirst ? '' : '-ml-3'} z-1 cursor-pointer`}
                >
                  <AvatarText fullName={itemName} className='w-full h-full text-base flex items-center justify-center' />
                </div>
              )}
            </Tooltip>
          );
        })}
        {remainingCount > 0 && (
          <Tooltip title={`Còn ${remainingCount} người khác`} placement='top'>
            <div
              className='size-[30px] rounded-full overflow-hidden border-2 border-[#549AE8] flex items-center justify-center bg-[#549AE8] text-white font-semibold responsive-text-xs -ml-3 z-1 cursor-pointer'
            >
              +{remainingCount}
            </div>
          </Tooltip>
        )}
        {!isSingle && displayAvatars.length > 0 && (
          <div
            className='size-[30px] rounded-full overflow-hidden border-[2px] border-dashed border-gray-300 group-hover:border-blue-fmrp group-hover:text-blue-fmrp transition-colors flex items-center justify-center bg-white text-gray-400 responsive-text-base leading-[150%] -ml-3 z-1 cursor-pointer'
          >
            +
          </div>
        )}
        {isSingle && (
          <span className='responsive-text-sm mr-1 font-medium text-[#101828] truncate max-w-[160px]' title={avatarList[0]?.name || ''}>
            {avatarList[0]?.name || ''}
          </span>
        )}
      </div>
    </div>
  );
};

export default Avatar;
