import java.awt.event.MouseListener;
import java.awt.event.MouseEvent;
import java.awt.event.ActionListener;
import java.awt.event.ActionEvent;
import java.awt.event.KeyListener;
import java.awt.event.KeyEvent;

class Controller implements ActionListener, MouseListener, KeyListener
{
	View view;
	Model model;
	boolean keyLeft;
	boolean keyRight;
	boolean keyUp;
	boolean keyDown;

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
				model.addThing(x , y, curr_index);
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

                    temp = Math.sqrt(Math.pow((qx - px),2) + Math.pow((qy - py),2));
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
	
	public void keyPressed(KeyEvent e)
	{
		switch(e.getKeyCode())
		{
			case KeyEvent.VK_RIGHT: 
				keyRight = true; 
				break;
			case KeyEvent.VK_LEFT: 
				keyLeft = true; 
				break;
			case KeyEvent.VK_UP: 
				keyUp = true; 
				break;
			case KeyEvent.VK_DOWN: 
				keyDown = true; 
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
