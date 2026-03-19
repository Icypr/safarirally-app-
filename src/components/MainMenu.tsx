import React, { useState } from 'react';
import { CarConfig, LevelConfig, UpgradeConfig, cars, levels, upgrades, colors, campaignTiers, CampaignTier, RaceConfig } from '../gameData';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Car, Map as MapIcon, Coins, Zap, Weight, Gauge, ShoppingCart, CheckCircle2, Palette, Settings2, ArrowLeft, ChevronRight, Info, CloudRain, Wind, Sun, Cloud } from 'lucide-react';

interface MenuProps {
  tokens: number;
  ownedCars: string[];
  selectedCarId: string;
  carCustomizations: { [carId: string]: { color: string; upgrades: string[] } };
  onSelectCar: (carId: string) => void;
  onBuyCar: (car: CarConfig) => void;
  onCustomizeCar: (carId: string, color: string) => void;
  onBuyUpgrade: (carId: string, upgrade: UpgradeConfig) => void;
  onStartLevel: (level: RaceConfig) => void;
  onEnterShowroom: () => void;
}

interface CarCardProps {
  car: CarConfig;
  isOwned: boolean;
  isSelected: boolean;
  customization?: { color: string; upgrades: string[] };
  onSelectCar: (carId: string) => void;
  onBuyCar: (car: CarConfig) => void;
  onCustomize: (car: CarConfig) => void;
  tokens: number;
}

const StatBar = ({ label, value, max, icon: Icon, color }: { label: string, value: number, max: number, icon: any, color: string }) => (
  <div className="space-y-1">
    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
      <div className="flex items-center gap-1">
        <Icon size={10} className={color} />
        {label}
      </div>
      <span>{value}</span>
    </div>
    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${(value / max) * 100}%` }}
        className={`h-full ${color.replace('text-', 'bg-')}`}
      />
    </div>
  </div>
);

const CarCard: React.FC<CarCardProps> = ({ car, isOwned, isSelected, customization, onSelectCar, onBuyCar, onCustomize, tokens }) => {
  const activeUpgrades = (customization?.upgrades || []).map(uid => upgrades.find(u => u.id === uid)).filter(Boolean) as UpgradeConfig[];
  
  const engineBonus = activeUpgrades.filter(u => u.type === 'engine').reduce((acc, u) => acc + u.bonus, 0);
  const tireBonus = activeUpgrades.filter(u => u.type === 'tires').reduce((acc, u) => acc + u.bonus, 0);
  const suspensionBonus = activeUpgrades.filter(u => u.type === 'suspension').reduce((acc, u) => acc + u.bonus, 0);

  const finalEngineForce = car.engineForce + engineBonus;
  const finalGrip = 5 + (tireBonus * 10);
  const finalStability = 30 + (suspensionBonus * 50);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`glass-card p-6 rounded-2xl border-2 transition-all relative overflow-hidden group flex flex-col ${
        isSelected ? 'border-safari-gold bg-safari-gold/10' : 'border-white/5 hover:border-white/20'
      }`}
    >
      {isSelected && (
        <div className="absolute top-0 right-0 bg-safari-gold text-black px-3 py-1 text-[10px] font-black uppercase italic rounded-bl-xl">
          Active
        </div>
      )}
      
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-2xl font-black italic uppercase tracking-tighter">{car.name}</h3>
          <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-wider">{car.description}</p>
        </div>
        <div 
          className="w-12 h-12 rounded-xl border-2 border-white/10 shadow-inner"
          style={{ backgroundColor: customization?.color || car.color }}
        />
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-6">
        <StatBar label="Power" value={finalEngineForce} max={8000} icon={Zap} color="text-amber-400" />
        <StatBar label="Weight" value={car.mass} max={3000} icon={Weight} color="text-blue-400" />
        <StatBar label="Grip" value={finalGrip} max={10} icon={Gauge} color="text-emerald-400" />
        <StatBar label="Stability" value={finalStability} max={60} icon={Settings2} color="text-purple-400" />
      </div>

      <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-white/5">
        {isOwned ? (
          <>
            <button 
              onClick={() => onSelectCar(car.id)}
              className={`w-full py-3 rounded-xl font-black uppercase italic tracking-tighter transition-all flex items-center justify-center gap-2 ${
                isSelected 
                  ? 'bg-safari-gold text-black cursor-default' 
                  : 'bg-white/5 hover:bg-white/10 text-white'
              }`}
            >
              {isSelected ? <CheckCircle2 size={18} /> : null}
              {isSelected ? 'Selected' : 'Select Vehicle'}
            </button>
            <button 
              onClick={() => onCustomize(car)}
              className="w-full py-2 rounded-xl font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
            >
              <Settings2 size={14} />
              Customize & Upgrade
            </button>
          </>
        ) : (
          <button 
            onClick={() => onBuyCar(car)}
            disabled={tokens < car.cost}
            className={`w-full py-3 rounded-xl font-black uppercase italic tracking-tighter transition-all flex items-center justify-center gap-2 ${
              tokens >= car.cost 
                ? 'bg-safari-clay text-white hover:scale-[1.02] active:scale-95' 
                : 'bg-gray-800/50 text-gray-500 cursor-not-allowed'
            }`}
          >
            <ShoppingCart size={18} />
            Buy for {car.cost} Tokens
          </button>
        )}
      </div>
    </motion.div>
  );
};

export const MainMenu: React.FC<MenuProps> = ({
  tokens,
  ownedCars,
  selectedCarId,
  carCustomizations,
  onSelectCar,
  onBuyCar,
  onCustomizeCar,
  onBuyUpgrade,
  onStartLevel,
  onEnterShowroom
}) => {
  const [activeTab, setActiveTab] = useState<'garage' | 'showroom' | 'race'>('garage');
  const [customizingCar, setCustomizingCar] = useState<CarConfig | null>(null);
  const [selectedTier, setSelectedTier] = useState<CampaignTier | null>(null);

  const owned = cars.filter(c => ownedCars.includes(c.id));
  const available = cars.filter(c => !ownedCars.includes(c.id));

  if (customizingCar) {
    const customization = carCustomizations[customizingCar.id];
    return (
      <div className="fixed inset-0 bg-safari-storm/95 backdrop-blur-md flex flex-col items-center p-8 overflow-y-auto custom-scrollbar">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-4xl w-full space-y-8"
        >
          <button 
            onClick={() => setCustomizingCar(null)}
            className="flex items-center gap-2 text-gray-400 hover:text-white font-black uppercase italic tracking-tighter transition-all"
          >
            <ArrowLeft size={20} />
            Back to Garage
          </button>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-full md:w-1/3">
              <CarCard 
                car={customizingCar} 
                isOwned={true} 
                isSelected={selectedCarId === customizingCar.id} 
                customization={customization}
                onSelectCar={onSelectCar}
                onBuyCar={onBuyCar}
                onCustomize={() => {}}
                tokens={tokens}
              />
            </div>

            <div className="flex-1 space-y-8 w-full">
              {/* Color Selection */}
              <section className="glass-card p-6 rounded-2xl border-2 border-white/5">
                <div className="flex items-center gap-2 mb-4">
                  <Palette size={18} className="text-safari-gold" />
                  <h3 className="text-lg font-black italic uppercase tracking-tighter">Paint Shop</h3>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                  {colors.map(color => (
                    <button
                      key={color.value}
                      onClick={() => onCustomizeCar(customizingCar.id, color.value)}
                      className={`w-full aspect-square rounded-lg border-2 transition-all ${
                        customization.color === color.value ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </section>

              {/* Upgrades */}
              <section className="glass-card p-6 rounded-2xl border-2 border-white/5">
                <div className="flex items-center gap-2 mb-6">
                  <Zap size={18} className="text-safari-gold" />
                  <h3 className="text-lg font-black italic uppercase tracking-tighter">Performance Upgrades</h3>
                </div>
                
                <div className="space-y-8">
                  {['engine', 'tires', 'suspension'].map(type => (
                    <div key={type} className="space-y-3">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                          {type === 'engine' ? 'Engine & Power' : type === 'tires' ? 'Tires & Grip' : 'Suspension & Stability'}
                        </h4>
                        <span className="text-[10px] font-bold text-safari-gold uppercase">
                          Bonus: +{customization.upgrades.map(uid => upgrades.find(u => u.id === uid)).filter(u => u?.type === type).reduce((acc, u) => acc + (u?.bonus || 0), 0)}
                        </span>
                      </div>
                      <div className="grid gap-3">
                        {upgrades.filter(u => u.type === type).map(upgrade => {
                          const isOwned = customization.upgrades.includes(upgrade.id);
                          return (
                            <div key={upgrade.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                              isOwned ? 'bg-safari-gold/5 border-safari-gold/20' : 'bg-white/5 border-white/5'
                            }`}>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold uppercase text-sm">{upgrade.name}</h4>
                                  <span className="text-[10px] font-black text-safari-gold italic">+{upgrade.bonus}</span>
                                </div>
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">{upgrade.description}</p>
                              </div>
                              {isOwned ? (
                                <div className="flex items-center gap-1 text-emerald-400 text-[10px] font-black uppercase italic">
                                  <CheckCircle2 size={14} />
                                  <span>Installed</span>
                                </div>
                              ) : (
                                <button
                                  onClick={() => onBuyUpgrade(customizingCar.id, upgrade)}
                                  disabled={tokens < upgrade.cost}
                                  className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase italic transition-all flex items-center gap-2 ${
                                    tokens >= upgrade.cost 
                                      ? 'bg-white text-black hover:bg-safari-gold hover:scale-105 active:scale-95' 
                                      : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                  }`}
                                >
                                  <ShoppingCart size={12} />
                                  {upgrade.cost}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center bg-black overflow-hidden font-sans text-white">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          initial={{ scale: 1.1 }}
          animate={{ 
            scale: [1.1, 1.2, 1.1],
            x: [0, -20, 0],
            y: [0, 10, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 opacity-40 blur-xl"
        >
          <img 
            src="https://images.unsplash.com/photo-1532581133568-393f04805622?auto=format&fit=crop&q=80&w=1920" 
            alt="Safari Background" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-transparent via-black/20 to-black/60" />
      </div>

      <div className="relative z-10 w-full h-full flex flex-col items-center p-8 overflow-y-auto custom-scrollbar">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl w-full space-y-12"
        >
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <h1 className="text-7xl font-black italic uppercase tracking-tighter leading-none">
              Safari Rally <span className="text-safari-gold">Legends</span>
            </h1>
            <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-[10px] mt-4 flex items-center gap-2">
              <Trophy size={14} className="text-safari-gold" />
              East African Safari Classic Rally • Build v1.5
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="glass-card px-8 py-4 rounded-2xl flex items-center gap-4 border-l-4 border-safari-gold">
              <Coins className="text-safari-gold w-8 h-8" />
              <div>
                <p className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">Balance</p>
                <p className="text-4xl font-black tabular-nums">{tokens}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 p-1 bg-white/5 rounded-2xl w-fit mx-auto md:mx-0">
          {[
            { id: 'garage', label: 'My Garage', icon: Car },
            { id: 'showroom', label: '3D Showroom', icon: ShoppingCart },
            { id: 'race', label: 'Race Events', icon: MapIcon },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'showroom') {
                  onEnterShowroom();
                } else {
                  setActiveTab(tab.id as any);
                }
              }}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-black uppercase italic tracking-tighter transition-all ${
                activeTab === tab.id 
                  ? 'bg-white text-black shadow-xl' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'garage' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {owned.map(car => (
                  <CarCard 
                    key={car.id} 
                    car={car} 
                    isOwned={true} 
                    isSelected={selectedCarId === car.id} 
                    customization={carCustomizations[car.id]}
                    onSelectCar={onSelectCar}
                    onBuyCar={onBuyCar}
                    onCustomize={setCustomizingCar}
                    tokens={tokens}
                  />
                ))}
              </div>
            )}

            {activeTab === 'showroom' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {available.length > 0 ? (
                  available.map(car => (
                    <CarCard 
                      key={car.id} 
                      car={car} 
                      isOwned={false} 
                      isSelected={false} 
                      onSelectCar={onSelectCar}
                      onBuyCar={onBuyCar}
                      onCustomize={() => {}}
                      tokens={tokens}
                    />
                  ))
                ) : (
                  <div className="col-span-full glass-card p-12 rounded-3xl text-center border-dashed border-2 border-white/10">
                    <Trophy size={48} className="text-safari-gold mx-auto mb-4 opacity-50" />
                    <h3 className="text-2xl font-black italic uppercase">All Vehicles Owned</h3>
                    <p className="text-gray-400 mt-2">You have collected every vehicle in the Safari Rally Legends fleet.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'race' && (
              <motion.div 
                key="campaign"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <AnimatePresence mode="wait">
                  {!selectedTier ? (
                    <motion.div 
                      key="map"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.1 }}
                      className="relative w-full aspect-[16/9] glass-card rounded-3xl border-2 border-white/5 overflow-hidden bg-[url('https://picsum.photos/seed/rift-valley-map/1920/1080?blur=5')] bg-cover bg-center"
                    >
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                      
                      {/* Topographic Map Overlay (Stylized) */}
                      <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 1000 600">
                        <path d="M100,100 Q300,50 500,150 T900,100" fill="none" stroke="white" strokeWidth="2" />
                        <path d="M50,200 Q250,150 450,250 T850,200" fill="none" stroke="white" strokeWidth="2" />
                        <path d="M150,300 Q350,250 550,350 T950,300" fill="none" stroke="white" strokeWidth="2" />
                        <path d="M0,400 Q200,350 400,450 T800,400" fill="none" stroke="white" strokeWidth="2" />
                      </svg>

                      <div className="absolute inset-0 p-12 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <div>
                            <h2 className="text-4xl font-black italic uppercase tracking-tighter">Rift Valley Campaign</h2>
                            <p className="text-safari-gold font-bold uppercase tracking-widest text-xs mt-2">15 Tiers • 150 Stages • Legendary Rewards</p>
                          </div>
                          <div className="flex gap-4">
                            <div className="glass-card px-4 py-2 rounded-xl border border-white/10">
                              <p className="text-[10px] font-bold text-gray-400 uppercase">Progress</p>
                              <p className="text-xl font-black italic">0 / 150</p>
                            </div>
                          </div>
                        </div>

                        {/* Map Nodes */}
                        <div className="relative flex-1 mt-8">
                          {campaignTiers.map((tier, idx) => {
                            // Calculate node position along a stylized Rift Valley path
                            const x = 10 + (idx * 6);
                            const y = 20 + (Math.sin(idx * 0.5) * 15) + (idx * 4);
                            
                            return (
                              <motion.button
                                key={tier.id}
                                whileHover={{ scale: 1.2, zIndex: 10 }}
                                onClick={() => setSelectedTier(tier)}
                                className="absolute group"
                                style={{ left: `${x}%`, top: `${y}%` }}
                              >
                                <div className={`w-10 h-10 rounded-full border-4 flex items-center justify-center transition-all shadow-2xl ${
                                  tier.difficulty === 'Novice' ? 'border-emerald-500 bg-emerald-500/20' :
                                  tier.difficulty === 'Amateur' ? 'border-blue-500 bg-blue-500/20' :
                                  tier.difficulty === 'Pro' ? 'border-amber-500 bg-amber-500/20' :
                                  tier.difficulty === 'Elite' ? 'border-purple-500 bg-purple-500/20' :
                                  'border-red-500 bg-red-500/20'
                                }`}>
                                  <span className="text-xs font-black italic">{idx + 1}</span>
                                </div>
                                
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap">
                                  <div className="glass-card p-3 rounded-xl border border-white/10 shadow-2xl">
                                    <p className="text-[10px] font-black text-safari-gold uppercase tracking-widest">{tier.difficulty}</p>
                                    <p className="text-sm font-black italic uppercase">{tier.name}</p>
                                    <p className="text-[8px] text-gray-400 uppercase mt-1">{tier.region}</p>
                                  </div>
                                  <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white/10 mx-auto" />
                                </div>
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="tier-details"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      className="space-y-8"
                    >
                      <div className="flex items-center justify-between">
                        <button 
                          onClick={() => setSelectedTier(null)}
                          className="flex items-center gap-2 text-gray-400 hover:text-white font-black uppercase italic tracking-tighter transition-all"
                        >
                          <ArrowLeft size={20} />
                          Back to Map
                        </button>
                        <div className="text-right">
                          <h2 className="text-4xl font-black italic uppercase tracking-tighter">{selectedTier?.name || 'Unknown Tier'}</h2>
                          <p className="text-safari-gold font-bold uppercase tracking-widest text-xs mt-1">{selectedTier?.region || 'Unknown Region'}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                        {selectedTier?.races.map((race, idx) => (
                          <motion.div 
                            key={race.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="glass-card p-6 rounded-2xl border-2 border-white/5 hover:border-safari-gold/50 transition-all group"
                          >
                            <div className="flex justify-between items-start mb-4">
                              <span className="text-[10px] font-black text-gray-500 uppercase">Stage {idx + 1}</span>
                              {race.weather === 'Heavy Storm' ? <CloudRain size={14} className="text-blue-400" /> :
                               race.weather === 'Light Rain' ? <Cloud size={14} className="text-blue-300" /> :
                               race.weather === 'Dusty' ? <Wind size={14} className="text-amber-400" /> :
                               race.weather === 'Mist' ? <Cloud size={14} className="text-gray-400" /> :
                               <Sun size={14} className="text-safari-gold" />}
                            </div>
                            
                            <h4 className="text-lg font-black italic uppercase tracking-tighter leading-tight mb-4">{race.title}</h4>
                            
                            <div className="space-y-2 mb-6">
                              <div className="flex justify-between text-[8px] font-bold uppercase text-gray-400">
                                <span>Reward</span>
                                <span className="text-safari-gold">{race.reward} Tokens</span>
                              </div>
                              <div className="flex justify-between text-[8px] font-bold uppercase text-gray-400">
                                <span>Target</span>
                                <span>{race.targetTime}s</span>
                              </div>
                            </div>

                            <button 
                              onClick={() => onStartLevel(race)}
                              className="w-full bg-white/5 hover:bg-safari-gold hover:text-black py-2 rounded-xl text-[10px] font-black uppercase italic tracking-tighter transition-all"
                            >
                              Start Stage
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  </div>
);
};
