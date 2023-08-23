import Link from "next/link";
import path from "path";
import styles from "styles/components/sidebar.module.css";

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
  slugAsParams: string; 
}

interface NavigationProps {
  allItems: ItemProps[];
  category: string; 
  linkStyle: string;
  listStyle: string;
}

const Navigation = ({ allItems, category, linkStyle, listStyle }: NavigationProps) => {
  return (
    <div className={styles.navlist}>
      <ul className={styles.navItems}>
        {allItems.map((item, index) => (
          <li key={index}>
            <Link className={styles.navItem} href={category ? path.join(category, item.slugAsParams) : item.slugAsParams}>
              {formatLinkLabel(item.title)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Navigation;
