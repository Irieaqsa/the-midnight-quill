import { Heart, Users, Headphones, BookOpen } from 'lucide-react';

export function OurImpact() {
  const stats = [
    {
      value: '29',
      label: 'Active Writers',
      icon: Users,
      color: 'text-primary',
      bg: 'bg-primary/10 border-primary/20'
    },
    {
      value: '1',
      label: 'Podcast Season',
      icon: Headphones,
      color: 'text-pink-400',
      bg: 'bg-pink-400/10 border-pink-400/20'
    },
    {
      value: '20+',
      label: 'Published Works',
      icon: BookOpen,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10 border-amber-400/20'
    },
    {
      value: '100%',
      label: 'Human Written',
      icon: Heart,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10 border-emerald-400/20'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className={`p-6 bg-card/60 backdrop-blur-sm rounded-xl border border-white/5 flex flex-col items-center text-center transition-all duration-300 hover:border-white/10 hover:shadow-lg`}
          >
            <div className={`p-3 rounded-full mb-4 border ${stat.bg} ${stat.color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <span className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-1">
              {stat.value}
            </span>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {stat.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
export default OurImpact;
