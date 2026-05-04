<?php

namespace KdGraphics\GradientColorField\fields\data;

class GradientColorFieldData
{
    public string $type;
    public int $angle;
    public array $stops;

    public function __construct(string $type = 'linear', int $angle = 90, array $stops = [])
    {
        $this->type = in_array($type, ['linear', 'radial'], true) ? $type : 'linear';
        $this->angle = max(0, min(360, $angle));
        $this->stops = $stops;
    }

    public function getStops(): array
    {
        return $this->stops;
    }

    public function getJson(): string
    {
        return json_encode([
            'type' => $this->type,
            'angle' => $this->angle,
            'stops' => $this->stops,
        ], JSON_UNESCAPED_SLASHES) ?: '';
    }

    public function getCssGradient(): string
    {
        if (empty($this->stops)) {
            return 'linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(255,255,255,1) 100%)';
        }

        $parts = [];
        foreach ($this->stops as $stop) {
            $color = (string)($stop['color'] ?? '#000000');
            $alpha = max(0, min(1, (float)($stop['alpha'] ?? 1)));
            $pos = max(0, min(100, (float)($stop['position'] ?? 0)));
            $rgb = $this->hexToRgb($color);
            $parts[] = sprintf('rgba(%d, %d, %d, %.4F) %.2F%%', $rgb['r'], $rgb['g'], $rgb['b'], $alpha, $pos);
        }

        if ($this->type === 'radial') {
            return sprintf('radial-gradient(circle at center, %s)', implode(', ', $parts));
        }

        return sprintf('linear-gradient(%ddeg, %s)', $this->angle, implode(', ', $parts));
    }

    public function cssGradient(): string
    {
        return $this->getCssGradient();
    }

    private function hexToRgb(string $hex): array
    {
        $hex = ltrim(strtolower(trim($hex)), '#');
        if (strlen($hex) === 3) {
            $hex = $hex[0] . $hex[0] . $hex[1] . $hex[1] . $hex[2] . $hex[2];
        }
        if (!preg_match('/^[0-9a-f]{6}$/', $hex)) {
            $hex = '000000';
        }

        return [
            'r' => hexdec(substr($hex, 0, 2)),
            'g' => hexdec(substr($hex, 2, 2)),
            'b' => hexdec(substr($hex, 4, 2)),
        ];
    }
}
