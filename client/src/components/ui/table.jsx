import * as React from "react";

export const Table = React.forwardRef(({ className, ...props }, ref) => (
  <table ref={ref} className={`w-full border-collapse ${className || ''}`} {...props} />
));
Table.displayName = "Table";

export const Thead = React.forwardRef(({ className, ...props }, ref) => (
  <thead ref={ref} className={`bg-gray-100 dark:bg-gray-800 ${className || ''}`} {...props} />
));
Thead.displayName = "Thead";

export const Tbody = React.forwardRef(({ className, ...props }, ref) => (
  <tbody ref={ref} className={className} {...props} />
));
Tbody.displayName = "Tbody";

export const Tr = React.forwardRef(({ className, ...props }, ref) => (
  <tr ref={ref} className={`border-b border-gray-200 dark:border-gray-700 ${className || ''}`} {...props} />
));
Tr.displayName = "Tr";

export const Th = React.forwardRef(({ className, ...props }, ref) => (
  <th ref={ref} className={`px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-200 ${className || ''}`} {...props} />
));
Th.displayName = "Th";

export const Td = React.forwardRef(({ className, ...props }, ref) => (
  <td ref={ref} className={`px-4 py-2 text-gray-700 dark:text-gray-200 ${className || ''}`} {...props} />
));
Td.displayName = "Td";
