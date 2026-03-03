import { BookCheck, Bot, ChartSpline, LockKeyhole, Plug, TabletSmartphone } from "lucide-react";

export const security_data=[
    {
        id:"0",
        title:"Real-Time Threat Detection",
        description:"Monitor and detect suspicious activities across your network with advanced analytics and machine learning algorithms.",
        icon: <LockKeyhole size={30}/>
    },
    {
        id:"1",
        title:"Automated Response",
        description:"Configure playbooks to automatically respond to security incidents, reducing response time and minimizing damage.",
        icon: <Bot size={30}/>
    },
    {
        id:"2",
        title:"Comprehensive Dashboards",
        description:"Visualize security data with intuitive dashboards that provide actionable insights at a glance.",
        icon: <ChartSpline size={30}/>
    },
    {
        id:"3",
        title:"Integration Ecosystem",
        description:"Connect with over 200 security tools and data sources to centralize your security operations.",
        icon: <Plug size={30}/>
    },
    {
        id:"4",
        title:"Mobile Alerts",
        description:"Stay informed with real-time notifications on critical security events via mobile app or SMS.",
        icon: <TabletSmartphone size={30}/>
    },
    {
        id:"5",
        title:"Compliance Reporting",
        description:"Generate comprehensive reports for regulatory compliance including GDPR, HIPAA, PCI DSS, and more.",
        icon: <BookCheck size={30}/>
    }
]