interface CreatorCellProps {
  creator?: {
    firstName: string;
    lastName?: string;
  } | null;
  align?: "left" | "center" | "right";
}

export const CreatorCell = ({ creator, align = "center" }: CreatorCellProps) => {
  if (!creator) {
    return <div className={`text-${align}`}>-</div>;
  }
  
  const name = `${creator.firstName} ${creator.lastName || ""}`.trim();
  return <div className={`text-${align}`}>{name}</div>;
};

