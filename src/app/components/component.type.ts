export interface inputProps {
  type: string;
  label: string;
  // onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChange: any;
  value: string;
}
export interface buttonProps {
  name: string;
  onClick?: () => void;
}
