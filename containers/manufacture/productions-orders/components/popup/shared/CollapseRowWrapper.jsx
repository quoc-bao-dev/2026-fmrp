import { AnimatePresence, motion } from 'framer-motion';

const COLLAPSE_VARIANTS = {
  open: { height: 'auto', opacity: 1 },
  closed: { height: 0, opacity: 0 },
};

const CollapseRowWrapper = ({ isOpen, children }) => {
  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div className='' initial='closed' animate='open' exit='closed' variants={COLLAPSE_VARIANTS} transition={{ duration: 0.3 }}>
          <div>{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CollapseRowWrapper;

