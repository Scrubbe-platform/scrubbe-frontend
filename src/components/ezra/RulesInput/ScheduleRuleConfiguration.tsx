import CButton from "@/components/ui/Cbutton";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
type Props = {
  onClose: () => void;
};
const ScheduleRuleConfiguration = ({ onClose }: Props) => {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-2xl font-bold dark:text-white">Schedule Rule</p>
      <div className="flex flex-col gap-2">
        <Input label="Rule Name" placeholder="e.g Fraud Detection" />
        {/* fill in the option using the image */}
        <div>
          <Select
            label="Metric"
            options={[
              { value: "Login Attempts", label: "Login Attempts" },
              { value: "Data Download Size", label: "Data Download Size" },
              { value: "API Call Volume", label: "API Call Volume" },
              { value: "New Location", label: "New Location" },
              { value: "Time of Access", label: "Time of Access" },
              {
                value: "Unusual Login Location",
                label: "Unusual Login Location",
              },
              {
                value: "Multiple Failed Login Attempts",
                label: "Multiple Failed Login Attempts",
              },
              {
                value: "High Value Transaction Spike",
                label: "High Value Transaction Spike",
              },
              {
                value: "Login During Unusual Hours",
                label: "Login During Unusual Hours",
              },
              {
                value: "Sudden Spike in API Calls",
                label: "Sudden Spike in API Calls",
              },
              {
                value: "New Device + Transaction",
                label: "New Device + Transaction",
              },
              {
                value: "Multiple Accounts from One IP",
                label: "Multiple Accounts from One IP",
              },
              { value: "Multiple Chargebacks", label: "Multiple Chargebacks" },
              { value: "Large Data Exports", label: "Large Data Exports" },
              {
                value: "Rapid Deposit- Withdrawal",
                label: "Rapid Deposit- Withdrawal",
              },
              {
                value: "Excessive Password Resets",
                label: "Excessive Password Resets",
              },
              {
                value: "Device Fingerprint Reuse",
                label: "Device Fingerprint Reuse",
              },
              {
                value: "Inconsistent KYC submissions",
                label: "Inconsistent KYC submissions",
              },
              {
                value: "Velocity of Risky Actions",
                label: "Velocity of Risky Actions",
              },
              {
                value: "Unauthorized Admin Role Assignment",
                label: "Unauthorized Admin Role Assignment",
              },
            ]}
          />
          <Input placeholder="Or enter custom metric" className=" -mt-2" />
        </div>

        <div>
          <Select
            label="Condition"
            options={[
              { label: "more than", value: "more than" },
              { label: "less than", value: "less than" },
              { label: "equals", value: "equals" },
              { label: "not equals", value: "not equals" },
              { label: "is", value: "is" },
              { label: "in", value: "in" },
              { label: "not in", value: "not in" },
              { label: "exceeds", value: "exceeds" },
              { label: "below", value: "below" },
            ]}
          />
          <Input placeholder="e.g 5" />
        </div>
        <div>
          <Input placeholder="e.g 5" label="Recurrence" />
        </div>
        <Select
          label="Recurrence"
          options={[
            { label: "No recurrence", value: "No recurrence" },
            { label: "Daily", value: "Daily" },
            { label: "Weekly", value: "Weekly" },
            { label: "Monthly", value: "Monthly" },
          ]}
        />

        <div className="flex gap-2 justify-end">
          <CButton
            onClick={onClose}
            className=" bg-transparent border border-colorScBlue text-colorScBlue w-fit hover:bg-transparent"
          >
            Close
          </CButton>
          <CButton className="w-fit">Schedule</CButton>
        </div>
      </div>
    </div>
  );
};

export default ScheduleRuleConfiguration;
