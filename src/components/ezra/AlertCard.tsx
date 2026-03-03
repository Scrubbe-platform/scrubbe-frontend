interface AlertCardProps {
  color: string;
  title: string;
  subtitle: string;
}
const AlertCard = ({ color, title, subtitle }: AlertCardProps) => (
  <div
    className={`rounded-lg p-1 px-2 mb-2 dark:bg-[#232b3b] bg-[#F9FAFB] border-l-4 ${color} h-[59px] flex flex-col justify-center`}
  >
    <div className="font-medium dark:text-white text-sm">{title}</div>
    <div className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</div>
  </div>
);

export default AlertCard;
