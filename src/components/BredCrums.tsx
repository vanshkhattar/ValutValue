import { Link } from 'react-router-dom';
import { MdOutlineSpaceDashboard } from 'react-icons/md';

interface BreadcrumbsProps {
  PageName: string;
  PageLink: string;
}

const Breadcrumbs = ({ PageName, PageLink }: BreadcrumbsProps) => {
  return (
    <div className="w-[96%] lg:w-[90%] mx-auto my-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Page Title */}
        <h1 className="text-3xl md:text-4xl font-semibold text-gray-800">{PageName}</h1>

        {/* Breadcrumb Path */}
        <nav aria-label="breadcrumb">
          <ol className="flex items-center gap-2 text-sm md:text-base text-blue-600">
            <li className="flex items-center gap-1">
              <MdOutlineSpaceDashboard className="text-lg" />
              <Link to="/" className="hover:underline">Dashboard</Link>
            </li>
            <li>/</li>
            <li className="text-gray-500 cursor-default">{PageName}</li>
          </ol>
        </nav>
      </div>
    </div>
  );
};

export default Breadcrumbs;
