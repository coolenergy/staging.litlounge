const sources = [
  "//galleryn12.awemdia.com/f8d2e11bd6c43618af00d6f28c91232a1c/54f05b6b7ad80e32d1274d84c93b5a5b.mp4?pstool=319_1&amp;psid=adentio&amp;hi=caba263425a4858a7f27f7c4d9e2b984",
  "//galleryn11.awemdia.com/f8d2e11bd6c43618af00d6f28c91232a14/3434b7a8360a516057828e53141bff0a.mp4?pstool=319_1&amp;psid=adentio&amp;hi=caba263425a4858a7f27f7c4d9e2b984",
  "//galleryn10.awemdia.com/f8d2e11bd6c43618af00d6f28c91232a1d/6f300cc899f01b79ebd351d5af5d0c40.mp4?pstool=319_1&amp;psid=adentio&amp;hi=caba263425a4858a7f27f7c4d9e2b984",
  "//galleryn10.awemdia.com/f8d2e11bd6c43618af00d6f28c91232a1c/115331e0533a11c5b879b85b8ea02c62.mp4?pstool=319_1&amp;psid=adentio&amp;hi=caba263425a4858a7f27f7c4d9e2b984",
  "//galleryn10.awemdia.com/f8d2e11bd6c43618af00d6f28c91232a19/9a2697902743467bb2b7b78013dbf3c0.mp4?pstool=319_1&amp;psid=adentio&amp;hi=caba263425a4858a7f27f7c4d9e2b984",
];

function VideoSource() {
  return <source src={sources[Math.floor(Math.random() * sources.length)]} type="video/mp4" />;
}

export default VideoSource;
