import Link from "next/link";
import React from "react";

export const MenuItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive?: boolean;
}> = ({ icon, label, href, isActive }) => {
  return (
    <Link href={href}>
      <div className="flex flex-col gap-1 justify-center items-center relative">
        <span className="text-4xl h-8">{icon}</span>
        <span className="text-sm text-gray-500">{label}</span>
        {isActive && (
          <div className="absolute -bottom-1 left-0 w-full h-1 bg-gray-700 rounded-full" />
        )}
      </div>
    </Link>
  );
};
