"use client";
import React from "react";
import { motion } from "framer-motion";

const brands = [
  {
    name: "Slack",
    icon: "/slack.svg",
  },
  {
    name: "Supabase",
    icon: "/suparbase.svg",
  },
  {
    name: "Microsoft",
    icon: "/microsoft.svg",
  },
  {
    name: "Github",
    icon: "/github.svg",
  },
  {
    name: "Amazon",
    icon: "/amazon.svg",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

const Brands = () => {
  return (
    <section className="px-4 md:px-6 lg:px-20 xl:px-20 py-20 relative overflow-clip z-10 h-auto bg-[url('/brand_bg.png')] bg-center bg-no-repeat bg-cover">
      <motion.div
        className=" max-w-[1440px] mx-auto space-y-8 "
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.div variants={itemVariants}>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold  text-center mb-2 text-white">
            Supported by Global Brands
          </h2>
          <motion.div
            className="w-24 h-2 bg-teal-400 mx-auto mb-12 rounded-full"
            variants={itemVariants}
          />
        </motion.div>

        <motion.div
          className="flex flex-wrap gap-5 items-center justify-center"
          variants={containerVariants}
        >
          {brands.map((brand) => (
            <motion.div
              className=" bg-white px-5 h-[50px] rounded-lg font-semibold flex items-center gap-3 cursor-pointer shadow-md"
              key={brand.name}
              variants={itemVariants}
              whileHover={{ scale: 1.07 }}
              whileTap={{ scale: 0.97 }}
            >
              <img
                src={brand.icon}
                alt={brand.name}
                className="h-7 w-7 object-contain"
              />
              {brand.name}
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Brands;
