declare module "react-rating-stars-component" {
  import { FC } from "react";

  interface ReactStarsProps {
    count?: number;
    onChange?: (newRating: number) => void;
    size?: number;
    value?: number;
    activeColor?: string;
    inactiveColor?: string;
    edit?: boolean;
    isHalf?: boolean;
    [key: string]: any;
  }

  const ReactStars: FC<ReactStarsProps>;
  export default ReactStars;
}
