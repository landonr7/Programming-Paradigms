import java.awt.event.MouseListener;
import java.awt.event.MouseEvent;
import java.awt.event.ActionListener;
import java.awt.event.ActionEvent;
import java.awt.event.KeyListener;
import java.awt.event.KeyEvent;
import java.awt.event.MouseMotionListener;
import java.awt.Point;
import java.awt.Robot;
import java.awt.MouseInfo;


class Controller implements ActionListener, MouseListener, KeyListener, MouseMotionListener
{
	View view;
	Model model;
	boolean keyLeft;
	boolean keyRight;
	boolean keyUp;
	boolean keyDown;
	int margin = 100;

	Controller(Model m)
	{
		model = m;
	}

	void setView(View v)
	{
		view = v;
	}

	public void actionPerformed(ActionEvent e)
	{
		switch(e.getActionCommand())
		{
			case "Save":
				model.save("map.json");
				System.out.println("Map saved.");
				break;

			case "Load":
				model.load("map.json");
				System.out.println("Map loaded.");
				view.repaint();
				break;
			
			case "Clear":
				for(int i = model.things.size() - 1; i >= 0 ; i--) 
				{
				model.removeThing(i);
				}
				view.repaint();
				break;

		}
	}
	
	public void mousePressed(MouseEvent e)
	{
		int x = e.getX();
		int y = e.getY();

		int curr_index = view.images.indexOf(view.curr_image);

		if ((x < 200) && (y < 200))
		{
            curr_index = (curr_index + 1) % view.images.size();
            view.curr_image = view.images.get(curr_index);
            view.repaint();
		}
		else
		{
			if (e.getButton() == 1)
			{
				model.addThing(x + view.x_scroll, y + view.y_scroll, curr_index);
				view.repaint();
			}
			if (e.getButton() == 3)
			{
				int px = e.getX();
                int py = e.getY();

                int qx = 0;
                int qy = 0;

                int min_index = 0;

                double dist = 999999999;
                double temp;

                int w = view.curr_image.getWidth();
                int h = view.curr_image.getHeight();

                for (int i = 0; i < model.things.size(); i++)
				{
                    qx = model.things.get(i).x - w / 2;
                    qy = model.things.get(i).y - h / 2;

                    temp = Math.sqrt(Math.pow(((qx - view.x_scroll) - px),2) + Math.pow(((qy - view.y_scroll) - py),2));
                    if (temp < dist)
					{
                        dist = temp;
                        min_index = i;
                    }
                }
                model.removeThing(min_index);
			}
		}
	}

	public void mouseReleased(MouseEvent e) 
	{	}
	
	public void mouseEntered(MouseEvent e) 
	{	}
	
	public void mouseExited(MouseEvent e) 
	{	}
	
	public void mouseClicked(MouseEvent e) 
	{	}
	
	public void mouseDragged(MouseEvent e) 
	{	}

	public void mouseMoved(MouseEvent e)
	{	
		int xWin = view.getWidth() / 2 - 150;
		int yWin = 0;
		int wWin = 300;
		int hWin = 110;	
		Point p = MouseInfo.getPointerInfo().getLocation();

		if ((e.getX() <= 200) && (e.getY() <= 200))
		{

		}
		else if (((e.getX() >= xWin) && (e.getX() <= (xWin + wWin))) && ((e.getY() >= yWin) && (e.getY() <= (yWin + hWin))))
		{

		}
		else{

			try
			{
				if (p.x >= (view.getWidth() - margin))
				{
					Robot boopbeep = new Robot();

					boopbeep.mouseMove(view.getWidth() - margin, p.y);
					view.x_scroll += 5;

				}
				else if(p.x <= margin)
				{
					Robot boopbeep1 = new Robot();

					boopbeep1.mouseMove(margin, p.y);
					view.x_scroll -= 5;				
				}
				else if(p.y >= (view.getHeight() - margin))
				{
					Robot boopbeep2 = new Robot();

					boopbeep2.mouseMove(p.x, view.getHeight() - margin);
					view.y_scroll += 5;	
				}
				else if(p.y <= margin)
				{
					Robot boopbeep3 = new Robot();

					boopbeep3.mouseMove(p.x, margin);
					view.y_scroll -= 5;	
				}
			}
			catch (Exception except)
			{
				except.printStackTrace(System.err);
				System.exit(1);
			}
		}




	}

	public void keyPressed(KeyEvent e)
	{
		switch(e.getKeyCode())
		{
			case KeyEvent.VK_RIGHT: 
				keyRight = true;
				view.x_scroll += 5;
				break;
			case KeyEvent.VK_LEFT: 
				keyLeft = true;
				view.x_scroll += -5;
				break;
			case KeyEvent.VK_UP: 
				keyUp = true; 
				view.y_scroll += -5;
				break;
			case KeyEvent.VK_DOWN: 
				keyDown = true;
				view.y_scroll += 5;
				break;
		}

	}

	public void keyReleased(KeyEvent e)
	{
		switch(e.getKeyCode())
		{
			case KeyEvent.VK_RIGHT: 
				keyRight = false; 
				break;
			case KeyEvent.VK_LEFT: 
				keyLeft = false; 
				break;
			case KeyEvent.VK_UP: 
				keyUp = false; 
				break;
			case KeyEvent.VK_DOWN: 
				keyDown = false; 
				break;
			case KeyEvent.VK_ESCAPE:
				System.exit(0);
		}
		char c = Character.toLowerCase(e.getKeyChar());
		if(c == 'q')
			System.exit(0);
        if(c == 'r')
            model.reset();
	}

	public void keyTyped(KeyEvent e)
	{	}

	void update()
	{
		if(keyRight) 
            model.dest_x += Model.speed;
		if(keyLeft) 
    		model.dest_x -= Model.speed;
		if(keyDown) 
            model.dest_y += Model.speed;
		if(keyUp)
            model.dest_y -= Model.speed;
	}

}
