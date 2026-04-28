import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerBody,
  DrawerFooter,
  DrawerClose,
} from 'zenput';
import type { DrawerSide, DrawerSize } from 'zenput';
import { Section, Scenario } from './_shell';

export function DrawerSection() {
  const sides: DrawerSide[] = ['right', 'left', 'top', 'bottom'];
  const sizes: DrawerSize[] = ['sm', 'md', 'lg'];

  return (
    <Section
      id="drawer"
      name="Drawer"
      description="Off-canvas panel that slides in from any edge — 4 sides, 3 sizes, modal and non-modal modes."
    >
      <Scenario title="All sides">
        <div className="row">
          {sides.map((side) => (
            <Drawer key={side}>
              <DrawerTrigger style={{ textTransform: 'capitalize' }}>From {side}</DrawerTrigger>
              <DrawerContent side={side}>
                <DrawerHeader>
                  <DrawerTitle>Drawer from {side}</DrawerTitle>
                  <DrawerDescription>Slides in from the {side} edge.</DrawerDescription>
                </DrawerHeader>
                <DrawerBody>
                  <p>Content area for a <code>{side}</code> drawer.</p>
                </DrawerBody>
                <DrawerFooter>
                  <DrawerClose>Close</DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          ))}
        </div>
      </Scenario>

      <Scenario title="Sizes (right side)">
        <div className="row">
          {sizes.map((size) => (
            <Drawer key={size}>
              <DrawerTrigger style={{ textTransform: 'uppercase' }}>{size}</DrawerTrigger>
              <DrawerContent side="right" size={size}>
                <DrawerHeader>
                  <DrawerTitle>Drawer — {size.toUpperCase()}</DrawerTitle>
                  <DrawerDescription>This is the <strong>{size}</strong> size.</DrawerDescription>
                </DrawerHeader>
                <DrawerBody>
                  <p>A <code>{size}</code>-sized drawer panel.</p>
                </DrawerBody>
                <DrawerFooter>
                  <DrawerClose>Close</DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          ))}
        </div>
      </Scenario>

      <Scenario title="No backdrop close (closeOnOverlayClick=false)">
        <Drawer closeOnOverlayClick={false}>
          <DrawerTrigger>Open persistent drawer</DrawerTrigger>
          <DrawerContent side="right">
            <DrawerHeader>
              <DrawerTitle>Persistent drawer</DrawerTitle>
              <DrawerDescription>Click outside will not close this drawer.</DrawerDescription>
            </DrawerHeader>
            <DrawerBody>
              <p>Use the close button or Escape key to dismiss.</p>
            </DrawerBody>
            <DrawerFooter>
              <DrawerClose>Close</DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </Scenario>
    </Section>
  );
}
