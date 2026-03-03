import { Button } from "@/components/ui/button";

const PreviewDetails = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className=" bg-zinc-100 w-full rounded-lg p-4 flex flex-col gap-2">
        <p className="text-lg font-bold">Notifications</p>
        <div className="">
          <strong>Alice smith</strong>
          <span>-High failed attempt ratio detected</span> <br />
          <small>2025-05-28 12:01:04</small>
        </div>
        <div className="">
          <strong>Alice smith</strong>
          <span>-High failed attempt ratio detected</span> <br />
          <small>2025-05-28 12:01:04</small>
        </div>
        <div className="">
          <strong>Alice smith</strong>
          <span>-High failed attempt ratio detected</span> <br />
          <small>2025-05-28 12:01:04</small>
        </div>
      </div>

      <div className=" bg-zinc-100 w-full rounded-lg p-4 flex flex-col gap-2">
        <p className="text-lg font-bold">Rule Preview</p>
        <div className="">
          <strong>Actions:</strong>
          <span>-Notify Analyst</span>
        </div>
        <div className="">
          <strong>Time Window:</strong>
          <span>N/A</span>
        </div>
        <div className="">
          <strong>Severity: </strong>
          <span>N/A</span>
        </div>
        <div className="">
          <strong>Executation Date: </strong>
          <span>06/06/25</span>
        </div>
        <div className="">
          <strong>Reocurrence: </strong>
          <span>No</span>
        </div>
      </div>

      <div className=" bg-zinc-100 w-full rounded-lg p-4 flex flex-col gap-2">
        <p className="text-lg font-bold">Rule Preview</p>
        <p>6/6/2025, 11:46:18 John Doe loaded template-Phishing detection</p>
        <p>6/6/2025, 11:46:18 John Doe loaded template-Phishing detection</p>
        <p>6/6/2025, 11:46:18 John Doe loaded template-Phishing detection</p>
      </div>

      <div className=" bg-zinc-100 w-full rounded-lg p-4 flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <p className="text-lg font-bold">Saved Rules</p>
          <Button className="border border-colorScBlue text-colorScBlue bg-transparent h-[30px]">
            Edit
          </Button>
        </div>

        <p>
          <strong>Fraud Detection</strong> (Severity: low , Version : 1){" "}
        </p>
        <p>
          <strong>User:</strong> Any
        </p>
        <p>
          <strong>Login:</strong> If a user logs in more than twice notify
          analyst{" "}
        </p>
        <p>
          <strong>Tags:</strong> Fraud{" "}
        </p>
        <p>
          <strong>Date Created:</strong> 6/6/25 12:45:46 pm{" "}
        </p>
      </div>
      <div className=" bg-zinc-100 w-full rounded-lg p-4 flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <p className="text-lg font-bold">Scheduled Rules</p>
          <Button className="border border-colorScBlue text-colorScBlue bg-transparent h-[30px]">
            Edit
          </Button>
        </div>

        <p>
          <strong>Fraud Detection</strong> (Severity: low , Version : 1){" "}
        </p>
        <p>
          <strong>Metric:</strong> login attempt
        </p>
        <p>
          <strong>Condition:</strong> more than 5
        </p>
        <p>
          <strong>Execution Date:</strong> 6/6/25 12:45:46 pm{" "}
        </p>
        <p>
          <strong>Recurrence:</strong> Daily{" "}
        </p>
        <p>
          <strong>Status:</strong> Active{" "}
        </p>
      </div>
    </div>
  );
};

export default PreviewDetails;
