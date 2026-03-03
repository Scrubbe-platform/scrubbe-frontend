import React, { ReactNode } from "react";
import { Button } from "../ui/button";

type Props = {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
};
const Cbutton = ({ children, className, onClick }: Props) => {
  return (
    <Button
      className={`bg-gradient-to-t to-colorScBlue from-blue-800 text-white ${className}`}
      onClick={onClick}
    >
      {children}
    </Button>
  );
};

export default Cbutton;
