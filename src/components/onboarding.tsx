'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNetwork } from '@/lib/contexts/network-context'
import { useRole, UserRole } from '@/lib/contexts/role-context'
import { useOnboardingStore } from '@/lib/stores/onboarding-store'

const onboardingSteps = [
  {
    title: "Welcome to OmniPools",
    subtitle: "Chain-abstracted payouts for events",
    description: "Create pools, manage participants, and execute atomic payouts with audit-ready transparency.",
    image: "/sticker.png"
  },
  {
    title: "AI-Powered Pool Creation",
    subtitle: "Describe your event in natural language",
    description: "Our AI generates the perfect pool configuration, from bounties to tournaments to grant rounds.",
    image: "/assets/omnipools_banner_highcontrast.png"
  },
  {
    title: "Flow Actions Payouts",
    subtitle: "Atomic, audit-ready transactions",
    description: "Execute payouts with weak guarantees - failed recipients don't block successful ones.",
    image: "/assets/omnipools_banner_inline.png"
  }
]

const roles: { role: UserRole; description: string; icon: string }[] = [
  {
    role: 'Organizer',
    description: 'Create and manage pools, set winners, execute payouts',
    icon: '👑'
  },
  {
    role: 'Sponsor',
    description: 'Fund pools and track impact across events',
    icon: '💰'
  },
  {
    role: 'Participant',
    description: 'Join pools, link receivers, and earn rewards',
    icon: '🎯'
  }
]

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0)
  const [showRoleSelection, setShowRoleSelection] = useState(false)
  const { authenticate, isAuthenticated } = useNetwork()
  const { role, setRole } = useRole()
  const { completeOnboarding } = useOnboardingStore()

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setShowRoleSelection(true)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    setShowRoleSelection(true)
  }

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole)
    if (!isAuthenticated) {
      authenticate()
    }
    completeOnboarding()
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  }

  if (showRoleSelection) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1020] p-4"
      >
        <div className="w-full max-w-2xl">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">Choose Your Role</h1>
            <p className="text-base sm:text-lg text-white/70">Select how you'll use OmniPools</p>
          </motion.div>

          <div className="grid gap-4 sm:gap-6 md:grid-cols-3 max-w-4xl mx-auto">
            {roles.map((roleOption, index) => (
              <motion.button
                key={roleOption.role}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleRoleSelect(roleOption.role)}
                className={`
                  p-6 sm:p-8 rounded-2xl border-2 transition-all duration-200 min-h-[160px] sm:min-h-[180px]
                  ${role === roleOption.role
                    ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                    : 'border-white/10 bg-white/5 hover:border-blue-500/50 hover:bg-blue-500/5 hover:shadow-lg'
                  }
                `}
              >
                <div className="text-4xl sm:text-5xl mb-4">{roleOption.icon}</div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-3">{roleOption.role}</h3>
                <p className="text-sm sm:text-base text-white/70 leading-relaxed">{roleOption.description}</p>
              </motion.button>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center mt-8"
          >
            <button
              onClick={() => setShowRoleSelection(false)}
              className="text-white/50 hover:text-white/70 text-sm"
            >
              ← Back to introduction
            </button>
          </motion.div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1020] p-4">
      <div className="w-full max-w-4xl">
        <AnimatePresence mode="wait" custom={1}>
          <motion.div
            key={currentStep}
            custom={1}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="text-center"
          >
            <motion.img
              src={onboardingSteps[currentStep].image}
              alt={onboardingSteps[currentStep].title}
              className="mx-auto mb-8 h-48 w-auto rounded-2xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            />
            
            <motion.h1
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {onboardingSteps[currentStep].title}
            </motion.h1>
            
            <motion.h2
              className="text-lg sm:text-xl lg:text-2xl text-blue-400 mb-6 sm:mb-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {onboardingSteps[currentStep].subtitle}
            </motion.h2>
            
            <motion.p
              className="text-white/70 text-base sm:text-lg lg:text-xl leading-relaxed max-w-3xl mx-auto px-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {onboardingSteps[currentStep].description}
            </motion.p>
          </motion.div>
        </AnimatePresence>

        <motion.div
          className="flex flex-col sm:flex-row justify-between items-center mt-12 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {/* Progress indicators */}
          <div className="flex space-x-3">
            {onboardingSteps.map((_, index) => (
              <div
                key={index}
                className={`
                  h-3 rounded-full transition-all duration-300
                  ${index === currentStep ? 'bg-blue-500 w-8' : 'bg-white/20 w-3'}
                `}
              />
            ))}
          </div>

          {/* Navigation buttons - Mobile-first */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={handleSkip}
              className="px-6 py-3 text-base text-white/60 hover:text-white/80 transition-colors min-h-[48px]"
            >
              Skip Introduction
            </button>
            
            <div className="flex gap-3">
              {currentStep > 0 && (
                <button
                  onClick={handlePrevious}
                  className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-white/10 text-white hover:bg-white/20 transition-all text-base font-medium min-h-[48px]"
                >
                  ← Previous
                </button>
              )}
              
              <button
                onClick={handleNext}
                className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-base font-bold min-h-[48px] shadow-lg"
              >
                {currentStep === onboardingSteps.length - 1 ? '🚀 Get Started' : 'Next →'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}