import {
  file02,
  homeSmile,
  plusSquare,
  searchMd,
} from "../assets";

export const navigation = [
  {
    id: "0",
    title: "About Us",
    url: "#About Us",
  },
  {
    id: "1",
    title: "features",
    url: "#features",
  },
  {
    id: "2",
    title: "Services",
    url: "#Services",
  },
  // {
  //   id: "3",
  //   title: "Contact",
  //   url: "#Contact",
  // },
  {
    id: "3",
    title: "New account",
    url: "#signup",
    onlyMobile: true,
  },
  {
    id: "4",
    title: "Connect your Wallet",
    url: "#login",
    onlyMobile: true,
  },
];

export const heroIcons = [homeSmile, file02, searchMd, plusSquare];

