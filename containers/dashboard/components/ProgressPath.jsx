import { useEffect, useState } from 'react';
import { MdArrowOutward } from 'react-icons/md';
import AnimatedProgressPath from './AnimatedProgressPath';
import MobileIcon from '@/components/icons/common/MobileIcon';
import { useGetInfoStepUse } from '@/hooks/dashboard/useGetInfoStepUse';
import PopupGuide from './PopupGuide';

const ProgressPath = () => {
  // const [progress, setProgress] = useState(null);
  const [pathHeight, setPathHeight] = useState(240);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const { data: infoStepUse } = useGetInfoStepUse();

  // Load trạng thái từ localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('progressPathCollapsed');
      if (savedState !== null) {
        setIsCollapsed(JSON.parse(savedState));
      }
    }
  }, []);

  // Lưu trạng thái vào localStorage
  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    if (typeof window !== 'undefined') {
      localStorage.setItem('progressPathCollapsed', JSON.stringify(newState));
    }
  };

  // useEffect(() => {
  //   if (!infoStepUse) return;
  //   if (typeof infoStepUse.total_radio === 'number') {
  //     setProgress(infoStepUse.total_radio);
  //   } else if (infoStepUse.total_radio) {
  //     setProgress(Number(infoStepUse.total_radio) || 0);
  //   }
  // }, [infoStepUse]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(min-width: 1536px)');

    const updateHeight = event => {
      const matches = event?.matches ?? mediaQuery.matches;
      setPathHeight(matches ? 350 : 240);
    };

    updateHeight(mediaQuery);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', updateHeight);
    } else {
      mediaQuery.addListener(updateHeight);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', updateHeight);
      } else {
        mediaQuery.removeListener(updateHeight);
      }
    };
  }, []);

  const stepsData = infoStepUse?.data || [];

  const WaterMark = () => {
    return (
      <svg width='700' height='271' viewBox='0 0 700 271' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <path
          d='M652.588 107.508C661.324 109.296 667.855 117.949 665.796 127.475C664.069 135.42 656.644 140.848 648.512 140.848H564.941V174.522H649.219C649.469 174.522 649.697 174.522 649.926 174.501C667.522 173.357 681.395 158.735 681.395 140.848C681.395 123.897 668.895 109.858 652.588 107.508ZM647.68 107.133C647.389 107.133 647.097 107.133 646.827 107.154H648.554C648.262 107.133 647.971 107.133 647.68 107.133Z'
          fill='#E5ECF6'
        />
        <path
          d='M399.443 82.923V208.215H365.583V121.567L393.349 81.0719C393.349 81.0719 393.37 81.0303 393.391 81.0095C393.516 80.8431 393.64 80.6768 393.807 80.5312C394.368 79.9904 395.138 79.6368 395.991 79.5952H396.261C397.322 79.6368 398.258 80.1984 398.84 81.0095C398.861 81.0303 398.882 81.0511 398.882 81.0719C399.235 81.6127 399.443 82.2367 399.443 82.923Z'
          fill='#E5ECF6'
        />
        <path
          d='M351.463 135.357H312.693C309.989 135.357 307.556 134.15 305.934 132.237L298.571 122.836V82.9435C298.571 81.0924 300.068 79.6157 301.899 79.6157C303.022 79.6157 304.02 80.1773 304.623 81.03C304.644 81.0508 304.665 81.0716 304.665 81.0924L332.099 116.097L344.141 131.467C344.329 131.738 344.516 131.987 344.724 132.237C346.346 134.15 348.78 135.357 351.483 135.357H351.463Z'
          fill='#E5ECF6'
        />
        <path
          d='M395.994 79.5952C395.141 79.6368 394.372 79.9904 393.81 80.5312C393.644 80.6768 393.519 80.8431 393.394 81.0095C393.373 81.0303 393.353 81.0511 393.353 81.0719L365.586 121.567L358.805 131.468C358.618 131.738 358.431 131.987 358.202 132.237C356.601 134.151 354.167 135.357 351.463 135.357C348.759 135.357 346.326 134.151 344.704 132.237C344.496 131.987 344.308 131.738 344.121 131.468L332.079 116.097L359.492 81.0927C359.492 81.0927 359.513 81.0511 359.533 81.0303C360.136 80.1776 361.135 79.616 362.258 79.616H394.351L395.994 79.5952Z'
          fill='#E5ECF6'
        />
        <path
          d='M195.011 129.267C194.554 131.701 194.034 134.113 193.389 136.484C187.461 158.926 173.672 178.207 155.119 191.144C146.238 197.342 136.337 202.042 125.896 204.975C120.489 206.493 114.935 207.533 109.34 208.074C103.309 208.677 97.1104 208.199 91.0163 208.386C79.8888 208.698 69.3022 209.946 58.7363 213.606C49.46 216.83 40.6827 221.489 32.7791 227.354C23.3988 234.322 15.9528 242.829 9.29709 252.355C5.57407 258.033 2.45428 264.106 0 270.533C3.51503 252.667 9.58833 235.695 17.8039 220.054C17.8663 219.908 17.9495 219.763 18.0119 219.617C19.5302 216.726 21.1317 213.856 22.7956 211.048C22.858 210.923 22.9413 210.819 23.0037 210.715C28.1618 202.645 34.6095 195.491 42.0347 189.521C50.3959 182.783 59.9635 177.562 70.1966 174.234C81.6569 170.511 93.5746 170.095 105.492 169.097C122.34 167.683 139.478 162.712 155.16 156.534C155.223 156.534 155.285 156.493 155.327 156.451C158.613 155.266 161.858 153.893 164.957 152.354C176.438 146.717 186.65 138.814 194.97 129.267H195.011Z'
          fill='#E5ECF6'
        />
        <path
          d='M284.903 0C284.903 0 284.882 0.145592 284.862 0.228787C284.258 3.43181 283.551 6.63483 282.74 9.75466C274.691 40.2042 255.972 66.3275 230.847 83.8609C217.847 92.9084 203.226 99.6264 187.834 103.474C170.426 107.842 152.414 106.615 134.63 107.904C93.4068 110.858 55.8646 131.948 33.1729 166.807C28.1395 174.544 23.8757 182.843 20.5479 191.599C25.4564 166.64 33.9841 143.013 45.5899 121.236C47.2954 118.054 49.0633 114.914 50.8936 111.815C58.0485 100.313 67.0753 90.0798 77.5788 81.6147C88.4983 72.8375 100.894 65.9739 114.143 61.4606C133.195 54.9713 153.225 55.6993 172.859 52.6627C192.722 49.5844 212.231 44.3015 230.93 36.9387C230.992 36.8971 231.075 36.8555 231.159 36.8347C235.942 35.1084 240.622 33.1118 245.136 30.8447C260.34 23.2115 273.859 12.6873 284.903 0Z'
          fill='#E5ECF6'
        />
        <path
          d='M284.903 0C284.903 0 284.882 0.145592 284.862 0.228787C274.587 21.7348 260.444 40.2458 243.576 54.3682C229.786 65.9115 214.291 74.4598 197.984 79.3684C179.515 84.9425 160.4 83.3618 141.536 84.9841C97.8162 88.7487 58.0069 115.621 33.9424 160.005C28.5971 169.885 24.0629 180.451 20.5479 191.599C25.4564 166.64 33.9841 143.013 45.5899 121.236C47.2954 118.054 49.0633 114.914 50.8936 111.815C58.0485 100.313 67.0753 90.0798 77.5788 81.6147C88.4983 72.8375 100.894 65.9739 114.143 61.4606C133.195 54.9713 153.225 55.6993 172.859 52.6627C192.722 49.5844 212.231 44.3015 230.93 36.9387C230.992 36.8971 231.075 36.8555 231.159 36.8347C235.942 35.1084 240.622 33.1118 245.136 30.8447C260.34 23.2115 273.859 12.6873 284.903 0Z'
          fill='#E5ECF6'
        />
        <path
          d='M195.011 129.266C195.011 129.266 195.011 129.37 194.991 129.433C187.42 145.302 176.979 158.946 164.541 169.367C154.37 177.873 142.952 184.175 130.909 187.815C117.286 191.933 103.184 190.769 89.2693 191.954C57.0308 194.72 27.6626 214.542 9.92103 247.279C5.96922 254.559 2.64138 262.358 0.0415039 270.574C3.66053 252.167 9.94184 234.737 18.511 218.681C19.759 216.33 21.0693 214.022 22.4212 211.734C27.7042 203.248 34.3599 195.698 42.0971 189.458C50.1464 182.99 59.2979 177.915 69.0734 174.587C83.1335 169.803 97.9008 170.344 112.377 168.098C127.019 165.831 141.412 161.921 155.202 156.492C155.244 156.471 155.306 156.43 155.368 156.409C158.904 155.14 162.357 153.663 165.685 152C176.895 146.363 186.879 138.605 195.011 129.246V129.266Z'
          fill='#E5ECF6'
        />
        <path
          d='M514.984 157.051H515.025C525.009 153.515 532.143 143.989 532.143 132.82C532.143 118.614 520.62 107.092 506.415 107.092C505.874 107.092 505.312 107.113 504.772 107.154H506.997C510.658 107.154 514.11 109.234 515.483 112.624C517.771 118.323 513.07 123.918 507.6 123.918H448.718C430.02 123.918 414.857 139.08 414.857 157.779V208.216H448.718V157.591H474.28L509.555 208.216H550.467L514.984 157.051Z'
          fill='#E5ECF6'
        />
        <path
          d='M548.283 104.722C554.793 129.015 538.528 152.997 515.025 157.052C525.009 153.517 532.143 143.991 532.143 132.822C532.143 118.616 520.62 107.094 506.415 107.094C505.874 107.094 505.312 107.114 504.772 107.156H448.718C430.02 107.156 414.857 91.9936 414.857 73.2954H506.269C525.695 73.2954 543.27 85.9619 548.304 104.722H548.283Z'
          fill='#E5ECF6'
        />
        <path
          d='M699.844 124.189C699.698 151.581 677.277 174.147 649.926 174.501C667.522 173.357 681.395 158.735 681.395 140.848C681.395 123.897 668.895 109.858 652.588 107.508C652.526 107.487 652.485 107.466 652.422 107.466C651.382 107.258 650.301 107.154 649.219 107.154H648.554C648.262 107.133 647.971 107.133 647.68 107.133C647.389 107.133 647.097 107.133 646.827 107.154H564.941V73.481H648.221C676.112 73.481 699.989 96.2973 699.844 124.189Z'
          fill='#E5ECF6'
        />
        <path d='M448.718 157.593V208.218H414.857V191.454C414.857 172.756 430.02 157.593 448.718 157.593Z' fill='#E5ECF6' />
        <path
          d='M301.876 79.6157C300.045 79.6157 298.548 81.0924 298.548 82.9435V208.215H264.687V82.8811C264.687 82.694 264.708 82.5276 264.729 82.3404C264.729 82.3196 264.729 82.2988 264.749 82.278C264.874 81.654 265.186 81.0508 265.665 80.5725C266.268 79.9693 267.016 79.6573 267.807 79.6157H301.876Z'
          fill='#E5ECF6'
        />
        <path d='M598.615 107.154H564.941V208.215H598.615V107.154Z' fill='#E5ECF6' />
        <path
          d='M217.765 208.219C217.246 208.177 216.746 208.115 216.268 208.031C210.132 207.054 204.912 203.31 201.979 198.089C201.355 197.008 200.835 195.843 200.44 194.637C199.92 193.139 199.587 191.538 199.462 189.916C209.55 189.957 217.724 198.152 217.786 208.219H217.765Z'
          fill='#E5ECF6'
        />
        <path
          d='M211.068 186.067C211.068 187.481 211.193 188.875 211.484 190.247C210.09 189.311 208.593 188.542 207.012 187.939C206.658 185.734 206.679 183.488 207.116 181.262C208.572 181.637 209.986 182.177 211.296 182.905C211.13 183.945 211.068 184.985 211.068 186.067Z'
          fill='#E5ECF6'
        />
        <path
          d='M222.05 195.323C221.696 195.926 221.28 196.529 220.864 197.112C220.448 197.673 219.991 198.214 219.491 198.734C216.247 195.344 214.417 190.809 214.417 186.067C214.417 181.325 216.247 176.791 219.491 173.401C222.736 176.812 224.566 181.346 224.566 186.067C224.566 189.354 223.693 192.536 222.071 195.323H222.05Z'
          fill='#E5ECF6'
        />
        <path
          d='M227.896 186.066C227.896 185.006 227.813 183.945 227.667 182.905C228.977 182.198 230.392 181.657 231.848 181.283C232.284 183.487 232.305 185.734 231.952 187.918C230.371 188.5 228.873 189.269 227.5 190.185C227.771 188.833 227.896 187.46 227.896 186.066Z'
          fill='#E5ECF6'
        />
        <path
          d='M220.594 169.822L219.492 168.845L218.39 169.822C215.415 172.464 213.273 175.833 212.087 179.556C210.236 178.662 208.24 178.017 206.16 177.684L204.704 177.434L204.288 178.849C203.518 181.511 203.269 184.257 203.518 186.94C202.208 186.69 200.835 186.565 199.462 186.544C200.315 176.249 208.926 168.158 219.45 168.158C229.975 168.158 238.585 176.249 239.438 186.544C238.086 186.544 236.755 186.669 235.486 186.919C235.736 184.236 235.486 181.49 234.717 178.828L234.301 177.414L232.845 177.663C230.765 177.996 228.768 178.641 226.917 179.535C225.752 175.812 223.589 172.443 220.615 169.801L220.594 169.822Z'
          fill='#E5ECF6'
        />
        <path
          d='M239.416 189.891C239.291 191.534 238.958 193.115 238.438 194.612C238.043 195.819 237.523 196.984 236.899 198.086C233.967 203.265 228.808 207.009 222.735 208.007C222.194 208.09 221.654 208.173 221.113 208.215C221.113 204.845 222.049 201.684 223.671 198.98C224.004 198.398 224.378 197.836 224.794 197.275C228.122 192.824 233.447 189.933 239.416 189.912V189.891Z'
          fill='#E5ECF6'
        />
        <path d='M220.865 197.109C221.302 196.547 221.697 195.944 222.051 195.32C221.614 195.882 221.219 196.485 220.865 197.109Z' fill='#E5ECF6' />
        <path d='M223.653 198.962C224.048 198.421 224.422 197.86 224.776 197.256C224.36 197.797 223.986 198.359 223.653 198.962Z' fill='#E5ECF6' />
      </svg>
    );
  };

  const WrapContainer = () => {
    return (
      <svg width='100%' height='100%' viewBox='22.7 18.7 1920 470' preserveAspectRatio='none' fill='none' xmlns='http://www.w3.org/2000/svg' className='absolute inset-0'>
        <g filter='url(#filter0_d_15601_7714)'>
          <mask id='path-1-inside-1_15601_7714' fill='white'>
            <path d='M1910.7 18.7002C1928.37 18.7003 1942.7 33.0272 1942.7 50.7002V415.7C1942.7 433.373 1928.37 447.7 1910.7 447.7H1140.46C1129.4 447.7 1119.12 453.416 1113.28 462.815L1103.07 479.254C1099.42 485.128 1092.99 488.7 1086.08 488.7H877.603C870.807 488.7 864.475 485.248 860.793 479.535L849.726 462.364C843.834 453.223 833.703 447.7 822.828 447.7H54.7C37.0268 447.7 22.7 433.373 22.7 415.7V50.7002C22.7 33.0271 37.0268 18.7002 54.7 18.7002H1910.7Z' />
          </mask>
          <path
            d='M1910.7 18.7002C1928.37 18.7003 1942.7 33.0272 1942.7 50.7002V415.7C1942.7 433.373 1928.37 447.7 1910.7 447.7H1140.46C1129.4 447.7 1119.12 453.416 1113.28 462.815L1103.07 479.254C1099.42 485.128 1092.99 488.7 1086.08 488.7H877.603C870.807 488.7 864.475 485.248 860.793 479.535L849.726 462.364C843.834 453.223 833.703 447.7 822.828 447.7H54.7C37.0268 447.7 22.7 433.373 22.7 415.7V50.7002C22.7 33.0271 37.0268 18.7002 54.7 18.7002H1910.7Z'
            fill='url(#paint0_linear_15601_7714)'
            fill-opacity='0.5'
            shape-rendering='crispEdges'
          />
          <path
            d='M1910.7 18.7002L1910.7 16.7002H1910.7V18.7002ZM1942.7 50.7002L1944.7 50.7002V50.7002L1942.7 50.7002ZM1910.7 447.7L1910.7 449.7L1910.7 449.7L1910.7 447.7ZM1103.07 479.254L1104.77 480.309L1104.77 480.309L1103.07 479.254ZM877.603 488.7L877.603 490.7H877.603V488.7ZM860.793 479.535L859.112 480.619L859.112 480.619L860.793 479.535ZM22.7 415.7L20.7 415.7V415.7L22.7 415.7ZM849.726 462.364L851.407 461.281L849.726 462.364ZM1113.28 462.815L1111.58 461.76L1113.28 462.815ZM1910.7 18.7002L1910.7 20.7002C1927.27 20.7003 1940.7 34.1318 1940.7 50.7002L1942.7 50.7002L1944.7 50.7002C1944.7 31.9226 1929.48 16.7004 1910.7 16.7002L1910.7 18.7002ZM1942.7 50.7002H1940.7V415.7H1942.7H1944.7V50.7002H1942.7ZM1942.7 415.7H1940.7C1940.7 432.269 1927.27 445.7 1910.7 445.7L1910.7 447.7L1910.7 449.7C1929.48 449.7 1944.7 434.478 1944.7 415.7H1942.7ZM1910.7 447.7V445.7H1140.46V447.7V449.7H1910.7V447.7ZM1113.28 462.815L1111.58 461.76L1101.37 478.199L1103.07 479.254L1104.77 480.309L1114.98 463.87L1113.28 462.815ZM1103.07 479.254L1101.37 478.199C1098.08 483.485 1092.3 486.7 1086.08 486.7V488.7V490.7C1093.68 490.7 1100.75 486.771 1104.77 480.309L1103.07 479.254ZM1086.08 488.7V486.7H877.603V488.7V490.7H1086.08V488.7ZM877.603 488.7L877.603 486.7C871.486 486.7 865.788 483.593 862.474 478.452L860.793 479.535L859.112 480.619C863.162 486.903 870.127 490.7 877.603 490.7L877.603 488.7ZM860.793 479.535L862.474 478.452L851.407 461.281L849.726 462.364L848.044 463.448L859.112 480.619L860.793 479.535ZM822.828 447.7V445.7H54.7V447.7V449.7H822.828V447.7ZM54.7 447.7V445.7C38.1314 445.7 24.7 432.269 24.7 415.7L22.7 415.7L20.7 415.7C20.7 434.478 35.9223 449.7 54.7 449.7V447.7ZM22.7 415.7H24.7V50.7002H22.7H20.7V415.7H22.7ZM22.7 50.7002H24.7C24.7 34.1317 38.1314 20.7002 54.7 20.7002V18.7002V16.7002C35.9223 16.7002 20.7 31.9225 20.7 50.7002H22.7ZM54.7 18.7002V20.7002H1910.7V18.7002V16.7002H54.7V18.7002ZM849.726 462.364L851.407 461.281C845.147 451.568 834.383 445.7 822.828 445.7V447.7V449.7C833.024 449.7 842.521 454.878 848.044 463.448L849.726 462.364ZM1140.46 447.7V445.7C1128.71 445.7 1117.78 451.773 1111.58 461.76L1113.28 462.815L1114.98 463.87C1120.45 455.059 1130.09 449.7 1140.46 449.7V447.7Z'
            fill='url(#paint1_linear_15601_7714)'
            fill-opacity='0.8'
            mask='url(#path-1-inside-1_15601_7714)'
          />
        </g>
        <defs>
          <filter id='filter0_d_15601_7714' x='-30' y='-30' width='1980' height='530' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'>
            <feFlood flood-opacity='0' result='BackgroundImageFix' />
            <feColorMatrix in='SourceAlpha' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0' result='hardAlpha' />
            <feOffset dy='4' />
            <feGaussianBlur stdDeviation='11.35' />
            <feComposite in2='hardAlpha' operator='out' />
            <feColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.09 0' />
            <feBlend mode='normal' in2='BackgroundImageFix' result='effect1_dropShadow_15601_7714' />
            <feBlend mode='normal' in='SourceGraphic' in2='effect1_dropShadow_15601_7714' result='shape' />
          </filter>
          <linearGradient id='paint0_linear_15601_7714' x1='982.7' y1='18.7002' x2='982.7' y2='447.7' gradientUnits='userSpaceOnUse'>
            <stop stop-color='#E8F1FC' stop-opacity='0' />
            <stop offset='1' stop-color='#E8F1FC' />
          </linearGradient>
          <linearGradient id='paint1_linear_15601_7714' x1='982.7' y1='488.7' x2='982.7' y2='18.7002' gradientUnits='userSpaceOnUse'>
            <stop stop-color='#A7C8F1' />
            <stop offset='1' stop-color='#A7C8F1' stop-opacity='0' />
          </linearGradient>
        </defs>
        {/* Text và icon ở phần lõm */}
      </svg>
    );
  };

  return (
    <div>
      <div className='relative w-full pt-[30px] pb-[80px] overflow-hidden '>
        <div className='absolute inset-0 w-full h-full pointer-events-none overflow-visible pb-20'>
          <WrapContainer />
          <div
            className='absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-3 text-[#696969] cursor-pointer hover:opacity-80 transition-opacity pointer-events-auto'
            onClick={toggleCollapse}
          >
            <div className={`pt-1 transition-all duration-500 ease-in-out ${isCollapsed ? 'rotate-180' : ''}`}>
              <ArrowIcon />
            </div>
            <p className='select-none transition-all duration-500'>{isCollapsed ? 'Mở rộng' : 'Thu gọn'}</p>
          </div>

          <div className='absolute -top-[56px] right-4'>
            <WaterMark />
          </div>
        </div>

        <div className='w-full flex flex-col items-center justify-center relative z-10 '>
          <div className={`-mt-6 pb-4 min-h-[40px] w-full transition-all duration-500 ease-in-out`}>
            <h2
              className={`px-6 responsive-text-3xl leading-[160%] font-bold text-new-blue capitalize w-full transition-all duration-500 ease-in-out ${
                isCollapsed ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'
              }`}
            >
              Tiến trình hoàn thiện vận hành <br />
              xưởng sản xuất
            </h2>
          </div>

          <div className='w-full flex-1 flex items-center justify-center -mt-[3%] 2xl:-mt-[4%] pointer-events-none'>
            <AnimatedProgressPath percentage={infoStepUse?.total_radio} height={pathHeight} />
          </div>

          <div className='flex justify-around gap-4 w-full -mt-[3%] px-4'>
            {stepsData.map((step, index) => {
              const hasActiveChildren = step.children && step.children.length > 0 && step.children.some(child => child.active === 1 || child.active === true);
              const isActive = hasActiveChildren || step.active === 1 || step.active === true;
              const numberColor = isActive ? '#FFDBCC' : '#E1E1E1';
              const titleColor = isActive ? '#FE4C00' : '#696969';
              const isPhone = Number(step.order_by) >= 3 || step.is_mobile === '1';

              return (
                <div key={step.id || index} className='flex gap-2 text-left'>
                  <span className={`font-medium transition-all duration-500 ease-in-out ${isCollapsed ? 'text-[32px] leading-[32px]' : 'text-[100px]/[80px]'}`} style={{ color: numberColor }}>
                    {index + 1}
                  </span>
                  <div className='flex flex-col gap-1'>
                    <div className='flex items-center'>
                      <h3 className='inline font-bold responsive-text-lg capitalize transition-all duration-500 ease-in-out' style={{ color: titleColor }}>
                        {step.name}
                      </h3>
                      {isPhone && <MobileIcon className='size-7 flex-shrink-0' />}
                    </div>
                    <ul className={`list-disc list-inside space-y-0.5 ml-1 transition-all duration-500 ease-in-out overflow-hidden ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'}`}>
                      {(step.children || []).map((item, idx) => {
                        const itemColor = item.active ? '#0375F3' : '#898989';
                        return (
                          <li key={item.id || idx} className='responsive-text-sm transition-all duration-500 text-left leading-tight' style={{ color: itemColor }}>
                            <span
                              className='inline text-inherit cursor-pointer hover:opacity-80 transition-opacity group'
                              onClick={() => {
                                setSelectedItem(item);
                                setIsPopupOpen(true);
                              }}
                            >
                              {item.name}
                              <MdArrowOutward className='inline-block align-middle ml-1 text-base transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1' />
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Control buttons (optional) */}
          {/* <div className='mt-8 mb-8 flex flex-wrap justify-center gap-3'>
        <button onClick={() => setProgress(0)} className='px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors'>
          Reset
        </button>
        <button onClick={() => setProgress(25)} className='px-6 py-2 bg-blue-200 rounded-lg hover:bg-blue-300 transition-colors'>
          25%
        </button>
        <button onClick={() => setProgress(50)} className='px-6 py-2 bg-blue-300 rounded-lg hover:bg-blue-400 transition-colors'>
          50%
        </button>
        <button onClick={() => setProgress(75)} className='px-6 py-2 bg-blue-400 rounded-lg hover:bg-blue-500 transition-colors'>
          75%
        </button>
        <button onClick={() => setProgress(100)} className='px-6 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 text-white transition-colors'>
          100%
        </button>
      </div> */}

          {/* Popup Guide */}
          <PopupGuide
            open={isPopupOpen}
            onClose={() => {
              setIsPopupOpen(false);
              setSelectedItem(null);
            }}
            selectedItem={selectedItem}
            stepsData={stepsData}
            allStepsData={stepsData}
          />
        </div>
      </div>
    </div>
  );
};

export default ProgressPath;

const ArrowIcon = () => {
  return (
    <svg width='20' height='14' viewBox='0 0 20 14' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path d='M0.799805 9.71826L9.65837 0.858608C9.73648 0.780492 9.86313 0.780492 9.94123 0.858608L18.7998 9.71826' stroke='#696969' stroke-width='1.6' stroke-linecap='round' />
      <path d='M3.79883 12.7173L9.6574 6.858C9.73551 6.77988 9.86215 6.77988 9.94026 6.858L15.7988 12.7173' stroke='#696969' stroke-linecap='round' />
    </svg>
  );
};
