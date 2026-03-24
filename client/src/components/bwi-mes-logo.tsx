import React from "react";
import photoUrl from "@/assets/BWI_MES_logo.png";

type Props = {
    alt?: string;
    className?: string;
    width?: number | string;
    height?: number | string;
};

const BwiMesLogo: React.FC<Props> = ({ alt = "Photo", className, width, height }) => {
    return (
        <img
            src={photoUrl}
            alt={alt}
            className={className}
            width={width}
            height={height}
            loading="lazy"
            decoding="async"
        />
    );
};

export default BwiMesLogo;