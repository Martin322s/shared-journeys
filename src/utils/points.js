function getRankTitle(points) {
	if (points >= 800) return "👑 Легенда на пътя";
	if (points >= 500) return "🏆 Професионалист";
	if (points >= 300) return "💼 Отговорен член";
	if (points >= 150) return "🚗 Надежден шофьор";
	if (points >= 50) return "🚶 Активен пътник";
	return "🐣 Новобранец";
}

export default getRankTitle;