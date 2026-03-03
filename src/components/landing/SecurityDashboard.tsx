import { User, Key, Globe } from "lucide-react";

const SecurityDashboard = () => {
  return (
    <div className="w-full h-full bg-[#3C4399] flex flex-col items-center justify-center p-4">
      <div className="w-full h-full bg-white rounded-lg flex flex-col p-3 md:p-4">
        <h3 className="text-black text-xs md:text-sm font-semibold mb-2">
          See threats in motion. Understand risk in context. Act from your
          dashboard
        </h3>

        <div className="grid grid-cols-2 gap-2 md:gap-3 flex-grow">
          {/* Account Take Over Panel */}
          <div className="bg-blue-400 rounded-lg p-2 md:p-3 flex flex-col">
            <div className="flex items-center mb-1">
              <User className="h-3 w-3 md:h-4 md:w-4 mr-1 text-white" />
              <span className="text-white text-xs font-medium">
                Account take over
              </span>
            </div>
            <p className="text-white text-[8px] md:text-xs leading-tight">
              Scrubbe detects account takeovers by analyzing login behavior, IP
              location, and device fingerprints in real time. It flags
              suspicious patterns like impossible travel, repeated login
              failures, and unknown devices.
            </p>
            <p className="text-white text-[8px] md:text-xs leading-tight mt-1">
              When risk is high, it can automatically trigger alerts, block
              access, or escalate to your security team.
            </p>
          </div>

          {/* Credential Stuffing Panel */}
          <div className="bg-green-700 rounded-lg p-2 md:p-3 flex flex-col">
            <div className="flex items-center mb-1">
              <Key className="h-3 w-3 md:h-4 md:w-4 mr-1 text-white" />
              <span className="text-white text-xs font-medium">
                Credential Stuffing
              </span>
            </div>
            <p className="text-white text-[8px] md:text-xs leading-tight">
              Scrubbe identifies credential stuffing by tracking rapid-fire
              login attempts across users and dashboards. It flags logins using
              known breached credentials or reused email-password combos.
            </p>
            <p className="text-white text-[8px] md:text-xs leading-tight mt-1">
              Proxies, anonymizers, and IP reputation are analyzed to stop
              attacks before access is granted.
            </p>
          </div>

          {/* Fake Account Creation Panel */}
          <div className="bg-blue-100 rounded-lg p-2 md:p-3 flex flex-col">
            <div className="flex items-center mb-1">
              <User className="h-3 w-3 md:h-4 md:w-4 mr-1 text-gray-700" />
              <span className="text-gray-700 text-xs font-medium">
                Fake Account Creation
              </span>
            </div>
            <p className="text-gray-700 text-[8px] md:text-xs leading-tight">
              Scrubbe monitors every payment attempt in real time, detecting
              patterns like multiple failures, suspicious velocity, and
              blacklisted cards or BINs.
            </p>
            <p className="text-gray-700 text-[8px] md:text-xs leading-tight mt-1">
              It flags high-risk behaviors before funds move, protecting you
              from chargebacks, abuse, and payment scams.
            </p>
          </div>

          {/* Session Hijacking Panel */}
          <div className="bg-blue-500 rounded-lg p-2 md:p-3 flex flex-col">
            <div className="flex items-center mb-1">
              <Globe className="h-3 w-3 md:h-4 md:w-4 mr-1 text-white" />
              <span className="text-white text-xs font-medium">
                Session Hijacking
              </span>
            </div>
            <p className="text-white text-[8px] md:text-xs leading-tight">
              Scrubbe tracks every session with unique device fingerprints, IP
              behavior and login context. It flags anomalies like token reuse
              from new locations, sudden device changes or impossible travel
              logins.
            </p>
            <p className="text-white text-[8px] md:text-xs leading-tight mt-1">
              When hijacking is suspected, Scrubbe can instantly trigger
              re-authentication, block access or escalate incident
              automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboard;
