<?php

namespace KdGraphics\GradientColorField\fields;

use Craft;
use craft\base\CrossSiteCopyableFieldInterface;
use craft\base\ElementInterface;
use craft\base\Field;
use craft\base\InlineEditableFieldInterface;
use craft\base\MergeableFieldInterface;
use craft\helpers\Html;
use KdGraphics\GradientColorField\assetbundles\InputAssetBundle;
use KdGraphics\GradientColorField\assetbundles\SettingsAssetBundle;
use KdGraphics\GradientColorField\fields\data\GradientColorFieldData;
use yii\db\Schema;

class GradientColorFieldField extends Field implements InlineEditableFieldInterface, MergeableFieldInterface, CrossSiteCopyableFieldInterface
{
    public static function displayName(): string
    {
        return Craft::t('app', 'Gradient Color');
    }

    public static function icon(): string
    {
        return 'gradient';
    }

    public static function phpType(): string
    {
        return sprintf('\\%s|null', GradientColorFieldData::class);
    }

    public static function dbType(): string
    {
        return Schema::TYPE_TEXT;
    }

    public function normalizeValue(mixed $value, ?ElementInterface $element): mixed
    {
        if ($value instanceof GradientColorFieldData) {
            return $value;
        }

        if (is_array($value) && isset($value['gradient'])) {
            $value = $value['gradient'];
        }

        if (!is_string($value) || trim($value) === '') {
            return null;
        }

        $decoded = json_decode($value, true);
        if (!is_array($decoded)) {
            return null;
        }

        $type = (string)($decoded['type'] ?? 'linear');
        $angle = (int)($decoded['angle'] ?? 90);
        $stops = $this->normalizeStops($decoded['stops'] ?? []);

        if (empty($stops)) {
            return null;
        }

        return new GradientColorFieldData($type, $angle, $stops);
    }

    public function serializeValue(mixed $value, ?ElementInterface $element): mixed
    {
        return $value instanceof GradientColorFieldData ? $value->getJson() : null;
    }

    protected function inputHtml(mixed $value, ?ElementInterface $element, bool $inline): string
    {
        Craft::$app->getView()->registerAssetBundle(InputAssetBundle::class);

        /** @var GradientColorFieldData|null $value */
        return Craft::$app->getView()->renderTemplate('gradient-color-field/_fields/gradient-color-field/input', [
            'id' => $this->getInputId(),
            'name' => $this->handle,
            'gradient' => $value?->getJson() ?? '',
            'previewCss' => $value?->getCssGradient() ?? 'linear-gradient(90deg, #538e4c, #d20000)',
            'describedBy' => $this->describedBy,
        ]);
    }

    public function getSettingsHtml(): ?string
    {
        Craft::$app->getView()->registerAssetBundle(SettingsAssetBundle::class);

        return Craft::$app->getView()->renderTemplate('gradient-color-field/_fields/gradient-color-field/settings', [
            'field' => $this,
        ]);
    }

    public function getStaticHtml(mixed $value, ElementInterface $element): string
    {
        /** @var GradientColorFieldData|null $value */
        if (!$value) {
            return '';
        }

        return Html::tag('div', '', [
            'class' => ['gcf-static-preview'],
            'style' => ['background' => $value->getCssGradient()],
        ]);
    }

    public function getPreviewHtml(mixed $value, ElementInterface $element): string
    {
        /** @var GradientColorFieldData|null $value */
        return Html::tag('div', '', [
            'class' => ['gcf-static-preview', 'small'],
            'style' => ['background' => $value?->getCssGradient() ?? 'linear-gradient(90deg,#ccc,#eee)'],
        ]);
    }

    private function normalizeStops(mixed $rawStops): array
    {
        if (!is_array($rawStops)) {
            return [];
        }

        $stops = [];
        foreach ($rawStops as $stop) {
            if (!is_array($stop)) {
                continue;
            }

            $color = strtolower(trim((string)($stop['color'] ?? '')));
            if (!preg_match('/^#[0-9a-f]{6}$/', $color)) {
                continue;
            }

            $stops[] = [
                'position' => max(0, min(100, (float)($stop['position'] ?? 0))),
                'color' => $color,
                'alpha' => max(0, min(1, (float)($stop['alpha'] ?? 1))),
            ];
        }

        usort($stops, fn(array $a, array $b) => $a['position'] <=> $b['position']);
        return $stops;
    }
}
