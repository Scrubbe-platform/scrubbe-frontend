const mockTreatIntel = [
  {
    id: 1,
    name: "IP:192.168.1.1",
    status: "Malicious",
  },
  {
    id: 2,
    name: "IP:192.168.1.1",
    status: "Malicious",
  },
  {
    id: 3,
    name: "IP:192.168.1.1",
    status: "Malicious",
  },

  {
    id: 4,
    name: "IP:192.168.1.1",
    status: "Malicious",
  },
  {
    id: 5,
    name: "IP:192.168.1.1",
    status: "Malicious",
  },
];
const TreatIntel = () => {
  return (
    <div className="flex flex-col max-h-[calc(100vh-200px)] overflow-y-auto">
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4 dark:bg-transparent bg-white">
        <div className="space-y-2">
          {mockTreatIntel.map((item) => (
            <div key={item.id} className="dark:text-white">
              <span>{item.name}-</span>
              <span>
                <b>Status: </b>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TreatIntel;
