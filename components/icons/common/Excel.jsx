const ExcelIcon = ({ color = "currentColor", className = "" }) => {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.5 12V3.5C1.5 3.22386 1.72386 3 2 3H14C14.2761 3 14.5 3.22386 14.5 3.5V12C14.5 12 14.5 12.4142 14.2071 12.7071C14.2071 12.7071 13.9142 13 13.5 13H2.5C2.5 13 2.08579 13 1.79289 12.7071C1.79289 12.7071 1.5 12.4142 1.5 12ZM2.5 12H13.5V4H2.5V12Z"
        fill={color}
      />
      <path
        d="M2 7H14C14.2761 7 14.5 6.77614 14.5 6.5C14.5 6.22386 14.2761 6 14 6H2C1.72386 6 1.5 6.22386 1.5 6.5C1.5 6.77614 1.72386 7 2 7Z"
        fill={color}
      />
      <path
        d="M2 10H14C14.2761 10 14.5 9.77614 14.5 9.5C14.5 9.22386 14.2761 9 14 9H2C1.72386 9 1.5 9.22386 1.5 9.5C1.5 9.77614 1.72386 10 2 10Z"
        fill={color}
      />
      <path
        d="M5 6.5V12.5C5 12.7761 5.22386 13 5.5 13C5.77614 13 6 12.7761 6 12.5V6.5C6 6.22386 5.77614 6 5.5 6C5.22386 6 5 6.22386 5 6.5Z"
        fill={color}
      />
    </svg>
  );
};

export default ExcelIcon;
