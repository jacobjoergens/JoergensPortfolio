import Link from "next/link";
import path from "path";

interface LabelProps {
  label: string;
}

function formatLinkLabel(label: LabelProps["label"]) {
  const words = label.split(" ");
  return words.join("\n");
}

interface ItemProps {
  slug: string;
  title: string;
  category?: string | undefined; 
  slugAsParams: string; 
}

interface NavigationProps {
  allItems: ItemProps[];
  linkStyle: string;
  listStyle: string;
}

const Navigation = ({ allItems, linkStyle, listStyle }: NavigationProps) => {
  return (
    <div className="navlist">
      <ul className={listStyle}>
        {allItems.map((item, index) => (
          <li key={index}>
            <Link className={linkStyle} href={item.category ? path.join(item.category, item.slugAsParams) : item.slugAsParams}>
              {formatLinkLabel(item.title)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Navigation;
