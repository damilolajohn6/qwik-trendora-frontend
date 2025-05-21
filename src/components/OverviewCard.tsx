interface OverviewCardProps {
  title: string;
  value: number | string;
}

const OverviewCard = ({ title, value }: OverviewCardProps) => {
  return (
    <div className="bg-white p-3 md:p-4 rounded-lg shadow">
      <h3 className="text-sm md:text-lg font-semibold text-gray-700">
        {title}
      </h3>
      <p className="text-xl md:text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
};

export default OverviewCard;
